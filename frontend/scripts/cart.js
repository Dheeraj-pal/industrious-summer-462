//cart item count
let cart_items = JSON.parse(localStorage.getItem("cart_items")) || [];
let loginUser = JSON.parse(localStorage.getItem("loginUser")) || null;
let k = JSON.parse(localStorage.getItem("count"))
let sumCount = 0;

let displayCartCount = () => {
  let cart_items = JSON.parse(localStorage.getItem("cart_items")) || [];
  let loginUser = JSON.parse(localStorage.getItem("loginUser")) || null;
  let total_cart_item = document.getElementById("total-cart-item");
  let sumCount = 0;
  if (loginUser == null) {
    total_cart_item.innerText = sumCount;
  } else {
    if (cart_items.length > 0) {
      let elements = cart_items.filter((ele) => {
        if (loginUser.email == ele.email) return ele;
      });

      for (let i = 0; i < elements.length; i++) {
        let x = elements[i].cartItems;
        for (let j = 0; j < x.length; j++) {
          sumCount += x[j].count;
        }
      }
      total_cart_item.innerText = sumCount;
    } else {
      total_cart_item.innerText = sumCount;
    }
  }
};
displayCartCount();


// append total cart price Display
let displayTotalPrice = () => {
  let cart_items = JSON.parse(localStorage.getItem("cart_items")) || [];
  let loginUser = JSON.parse(localStorage.getItem("loginUser")) || null;
  let total_sum_amount = document.getElementById("subtotal");
  let totalSumAmount = 0;
  if (loginUser == null) {
    total_sum_amount.innerText = `$${totalSumAmount.toFixed(2)}`;
  } else {
    if (cart_items.length > 0) {
      let elements = cart_items.filter((ele) => {
        if (loginUser.email == ele.email) return ele;
      });
      for (let i = 0; i < elements.length; i++) {
        let x = elements[i].cartItems;
        for (let j = 0; j < x.length; j++) {
          totalSumAmount += x[j].count * x[j].price;
        }
      }
      total_sum_amount.innerText = `$${totalSumAmount.toFixed(2)}`;
    } else {
      total_sum_amount.innerText = `$${totalSumAmount.toFixed(2)}`;
    }
  }
};
displayTotalPrice();

// cart product append function
let totalRowPrice = 0;
let totalCartPrice = 0;

let appendFunction = (data) => {
  if (!data) return;
  let products_list = document.getElementById("products-list");
  products_list.innerHTML = "";

  // filtering current user cart_items
  let cartData = [];
  let userIndex = null;
  if (loginUser == null) {
    console.log("Login to get Cart Item");
  } else {
    if (cart_items.length > 0) {
      let elements = cart_items.filter((ele, index) => {
        if (loginUser.email == ele.email) {
          userIndex = index;
          return ele;
        }
      });

      for (let i = 0; i < elements.length; i++) {
        let x = elements[i].cartItems;
        for (let j = 0; j < x.length; j++) {
          cartData.push(x[j]);
        }
      }
    }
  }
  cartData.forEach((element, index, array) => {
    let i=1
    let row = document.createElement("div");
    row.setAttribute("id", "row");

    let img_secc = document.createElement("div");
    img_secc.setAttribute("id", "img-secc");

    let img = document.createElement("img");
    img.src = element[0].img;

    let prod_description = document.createElement("div");
    prod_description.setAttribute("id", "prod_description");

    let p1 = document.createElement("p");
    p1.innerText = element[0].title;
    p1.setAttribute("id", "prod-title");

    let p2 = document.createElement("p");
    let price = Number(element[0].price);
    price = price.toFixed(2);
    p2.innerText = `$${price}`;
    p2.setAttribute("id", "prod-price");

    prod_description.append(p1, p2);
    img_secc.append(img, prod_description);

    let btn_action = document.createElement("div");
    btn_action.setAttribute("id", "btn-action");

    let counter = document.createElement("div");
    counter.setAttribute("id", "counter");

    let btn1 = document.createElement("button");
    btn1.setAttribute("id", "dec");
    btn1.innerText = "-";

    let btn2 = document.createElement("button");
    btn2.setAttribute("id", "count-num");
    btn2.innerText = k;

    let btn3 = document.createElement("button");
    btn3.setAttribute("id", "inc");
    btn3.innerText = "+";

    let trash = document.createElement("i");
    trash.setAttribute("class", "fa fa-trash-o");
    trash.setAttribute("aria-hidden", "true");

    // remove from cart function
    trash.addEventListener("click", () => {
      array.splice(index, 1);
      let obj = {
        email: loginUser.email,
        cartItems: array,
      };
      let newArray = [];
      newArray.push(obj);

      localStorage.setItem("cart_items", JSON.stringify(newArray));
      displayCartCount();
      displayTotalPrice();
      window.location.reload();
    });

    counter.append(btn1, btn2, btn3);
    btn_action.append(counter, trash);

    let row_price_display = document.createElement("div");
    row_price_display.setAttribute("id", "row-price-display");

    // total row price
    let p3 = document.createElement("p");
    let total = (element[0].price * element[0].count).toFixed(2);
    totalRowPrice += +total;
    p3.innerText = `$${total}`;

    // increment the counter by one
    btn3.addEventListener("click", (e) => {
      qty++;
      console.log(qty)
      total = +total;
      total += element[0].price;
      total = Number(total).toFixed(2);

      btn2.innerText = qty;
      p3.innerText = `$${total}`;

      //store updated data to LS
      element[0].count = qty;
      cart_items.splice(userIndex, 1);
      let obj = {
        email: loginUser.email,
        cartItems: array,
      };
      cart_items.push(obj);
      localStorage.setItem("cart_items", JSON.stringify(cart_items));
      displayCartCount();
      displayTotalPrice();
    });

    // decrement the counter by one
    let qty = element[0].count;
    btn1.addEventListener("click", (e) => {
      if (qty > 1) {
        qty--;
        total = +total;
        total -= element[0].price;
        total = Number(total).toFixed(2);
        p3.innerText = `$${total}`;

        // store updated data to LS
        element[0].count = qty;
        cart_items.splice(userIndex, 1);
        let obj = {
          email: loginUser.email,
          cartItems: array,
        };
        cart_items.push(obj);
        localStorage.setItem("cart_items", JSON.stringify(cart_items));
        displayCartCount();
        displayTotalPrice();
      }
      btn2.innerText = qty;
    });

    row_price_display.append(p3);

    row.append(img_secc, btn_action, row_price_display);
    products_list.append(row);
  });
};
appendFunction(cart_items);

// redirect to checkout page
document.getElementById("checkout").addEventListener("click", () => {
  let elements = cart_items.filter((ele, index) => {
    if (loginUser.email == ele.email) {
      return ele;
    }
  });
  let flag = false;
  for (let i = 0; i < elements.length; i++) {
    let x = elements[i].cartItems;
    if (x.length > 0) flag = true;
  }
  if (flag) window.location.href = "checkout.html";
  else alert("Please select a cart item");
});
