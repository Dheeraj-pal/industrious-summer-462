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


  fetch("http://localhost:1999/users/register", {
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

