document.querySelector("form").addEventListener("submit", register);

function register(event) {
  event.preventDefault();

  let email = document.getElementById("email").value;
  let pass = document.getElementById("inpass").value;

  let user = {
    email,
    pass,
  };
  localStorage.setItem("loginUser", JSON.stringify(user))

  // console.log(user);

  fetch("https://industrious-summer-462-u3dp.onrender.com/users/login", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "content-type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      localStorage.setItem("token", res.token);
      window.location.href = "index.html";
    })
    .catch((err) => console.log(err, "Wrong credentails"));
}
