document.querySelector("form").addEventListener("submit", register);

function register() {
  
  let name = document.getElementById("fname").value;
  let email = document.getElementById("eMail").value;
  let pass = document.getElementById("Pass").value;

  let user = {
    name,
    email,
    pass,
  };

  console.log(user)

  localStorage.setItem("signupData", JSON.stringify(user));


  fetch("https://industrious-summer-462-u3dp.onrender.com/users/register", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "content-type": "application/json",
    },
  })
    .then((res) => {res.json(); alert("yaha to aagya")})
    .then((res) => {
      alert("registered")
      console.log(res);
    })
    .catch((err) => console.log(err, "wrong credentials"));

}
// ***********************************************************************

let cart_items = JSON.parse(localStorage.getItem("cart_items")) || [];
let loginUser = JSON.parse(localStorage.getItem("loginUser")) || null;
let sumCount = 0;

let displayCartCount = () => {
  let total_cart_item = document.getElementById("total-cart-item");
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

