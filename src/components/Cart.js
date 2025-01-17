import React, { useEffect, useState, useContext, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AppContext from "../AppContext";
import { toast } from "react-toastify";

const Cart = ({ user, active, setActive }) => {
  let id; //user id
  if (user) {
    id = user.user_id;
  }
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]); //orders
  const [cartOrders, setCartOrders] = useState([]); //cart
  const [cartSelected, setCartSelected] = useState([]); //checked orders
  const [selectAll, setSelectAll] = useState(false);
  let subtotal = 0; //price subtotal

  let componentMounted = true;
  const [loading, setLoading] = useState(false);
  const { isNewOrder, setIsNewOrder, setCartCheckout } = useContext(AppContext);

  // get all user orders from php
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);

      let response;
      if (user) {
        response = await axios.get(
          `http://localhost/10kg-collective/displayModule/user_order.php?user_id=${id}`
        );
      } else {
        response = { data: [] };
      }

      if (componentMounted) {
        setOrders(response.data);
        setLoading(false);
      }
      return () => {
        componentMounted = false;
      };
    };

    fetchOrder();
  }, [isNewOrder]);

  // reset isNewOrder to false
  useEffect(() => {
    if (isNewOrder) {
      setIsNewOrder(false);
    }
  }, [isNewOrder]);

  // get orders that have order status = "Cart"
  useEffect(() => {
    if (Array.isArray(orders) && orders.length > 0) {
      // pending orders
      const cartList = orders.filter((o) => o.order_status == "Cart"); //using === seems
      setCartOrders(cartList);
    }
  }, [orders]);

  // console.log(subtotal);
  // console.log(cartSelected);

  // get price subtotal
  cartSelected.forEach(
    (order) =>
      (subtotal += parseInt(order.item_price) * parseInt(order.order_qty))
  );

  // quantity input field
  const handleQuantityChange = (index, event) => {
    const newOrders = [...cartOrders];
    newOrders[index].order_qty = parseInt(event.target.value);
    setCartOrders(newOrders);
  };

  const handleMinus = (index) => {
    const newOrders = [...cartOrders];
    if (newOrders[index].order_qty > 1) {
      // get the order id
      const updateOrder = newOrders[index];
      const { order_id } = updateOrder;

      // new qty
      newOrders[index].order_qty -= 1;

      // prepare POST data
      let updateData = new FormData();
      updateData.append("action", "decrease");
      updateData.append("order_id", order_id);
      updateData.append("order_qty", newOrders[index].order_qty);

      const url = "http://localhost/10kg-collective/orderModule/cart_qty.php";

      // SEND TO BACKEND
      axios.post(url, updateData).then((response) => {
        // if success
        if (response.data === 1) {
          // update UI
          setCartOrders(newOrders);
        } else {
          toast.error("Error occured while decreasing qty", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
      });
    }
  };

  const handlePlus = (index) => {
    const newOrders = [...cartOrders];

    // get the order id
    const updateOrder = newOrders[index];
    const { order_id } = updateOrder;

    // new qty
    newOrders[index].order_qty += 1;

    // prepare POST data
    let updateData = new FormData();
    updateData.append("order_id", order_id);
    updateData.append("order_qty", newOrders[index].order_qty);

    const url = "http://localhost/10kg-collective/orderModule/cart_qty.php";

    // SEND TO BACKEND
    axios.post(url, updateData).then((response) => {
      // if success
      if (response.data === 1) {
        // update UI
        setCartOrders(newOrders);
      } else {
        toast.error("Error occured while increasing qty", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    });
  };

  // single order delete
  const handleDel = (index) => {
    // perma delete order from orders table
    const removedOrder = cartOrders[index];
    const { order_id } = removedOrder;
    // console.log(removedOrder);

    let delData = new FormData();
    delData.append("order_id", order_id);

    const url = "http://localhost/10kg-collective/orderModule/cart_delete.php";

    axios.post(url, delData).then((response) => {
      // if order deleted, remove it from my orders list
      if (response.data === 1) {
        const newOrders = cartOrders.filter(
          (order) => order != cartOrders[index]
        );
        // console.log(newOrders);
        setCartOrders(newOrders);
        toast.success("Order removed from cart!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else {
        toast.error("Failed to remove from cart!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    });
  };

  // checkbox
  const handleCheck = (e, index) => {
    if (index === -1) {
      // "Select All" checkbox is clicked
      setSelectAll(e.target.checked);
      if (e.target.checked) {
        setCartSelected([...cartOrders]);
      } else {
        setCartSelected([]);
      }
    } else {
      // other checkboxes are clicked
      if (e.target.checked) {
        setCartSelected([...cartSelected, cartOrders[index]]);
      } else {
        setCartSelected(
          cartSelected.filter(
            (order) => order.order_id !== cartOrders[index].order_id
          )
        );
      }
      setSelectAll(false); // Uncheck "Select All" checkbox
    }
  };

  // checkout btn
  const handleCheckout = () => {
    if (cartSelected.length > 0) {
      setCartCheckout(cartSelected);
      navigate("/Checkout");
      setActive(!active);
    } else {
      toast.error("Please select an order before proceeding to checkout", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  // close cart if user clicked outside the component
  const cartRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // console.log(subtotal);
  // console.log(cartSelected);
  console.log(cartOrders);
  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div
          className={`container-md cart-container bg-white shadow  ${
            active ? "cart-active" : ""
          }`}
          ref={cartRef}
        >
          <div className="cart-title-container d-flex justify-content-between align-items-center mb-3">
            <h5 className="section-title">Cart</h5>
            <button
              type="button"
              className="btn-close float-end"
              aria-label="Close"
              onClick={() => setActive(!active)}
            ></button>
          </div>

          <div className="container cart-order-list">
            {/* Order list */}
            <div className="row border-top mb-3">
              {cartOrders.length === 0 && (
                <div className="col-md-12 py-3">
                  <p>Your Cart is empty.</p>
                  <Link
                    to="/Shop"
                    onClick={() => setActive(!active)}
                    className="btn btn-secondary"
                  >
                    SHOP NOW
                  </Link>
                </div>
              )}

              {cartOrders.length > 0 && (
                <div className="cold-md-12 d-flex py-3 border-btm">
                  <div className="form-check w-25">
                    <input
                      className="form-check-input me-2"
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleCheck(e, -1)}
                      id="select-all"
                    />
                    <label
                      className="form-check-label fs-5"
                      htmlFor="select-all"
                    >
                      Select All
                    </label>
                  </div>
                </div>
              )}

              {cartOrders.map((order, index) => (
                <div key={index} className="col-md-12 d-flex py-3 border-btm">
                  <div className="align-self-center me-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`checkbox${index}`}
                      checked={cartSelected.some(
                        (selected) => selected.order_id === order.order_id
                      )}
                      value=""
                      aria-label="..."
                      onChange={(e) => handleCheck(e, index)}
                    />
                  </div>

                  <div className="cart-img-container me-3">
                    <img
                      src={order.image_src}
                      alt="-img"
                      className="w-100 h-100"
                    />
                  </div>

                  <div className="cart-item-info d-flex justify-content-between text-capitalize">
                    <div>
                      <h5 className="cart-item-title">{order.item_name}</h5>
                      <p className="cart-item-var">{order.item_variant}</p>
                      <p className="cart-item-size">{order.item_size}</p>
                      <p className="cart-item-price">₱{order.item_price}</p>
                      <div className="d-flex align-items-center">
                        <span
                          className="qty-btn fw-medium"
                          onClick={() => handleMinus(index)}
                        >
                          -
                        </span>
                        <input
                          type="number"
                          name="qty"
                          id="cartQty"
                          className="form-control w-25 text-center mx-2"
                          min="1"
                          value={order.order_qty}
                          onChange={(event) =>
                            handleQuantityChange(index, event)
                          }
                        />
                        <span
                          className="qty-btn fw-medium"
                          onClick={() => handlePlus(index)}
                        >
                          +
                        </span>
                      </div>
                    </div>
                    <div>
                      <button
                        className="btn btn-fix"
                        onClick={() => handleDel(index)}
                      >
                        {<FaTrash />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order total amount */}
          {cartOrders.length > 0 ? (
            <>
              <div className="mt-3">
                <h5>Subtotal: ₱{subtotal}</h5>
              </div>
              <button
                className="btn btn-secondary text-uppercase"
                onClick={() => handleCheckout()}
              >
                Proceed to Checkout
              </button>
            </>
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};

export default Cart;
