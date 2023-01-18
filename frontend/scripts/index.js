$(".refresh-carousel-div").owlCarousel({
  loop: true,
  margin: 10,
  nav: true,
  dots: false,
  responsive: {
    0: {
      items: 1,
    },
    600: {
      items: 3,
    },
    1000: {
      items: 5,
    },
  },
});

let token = localStorage.getItem("token");
// console.log(token)
if(token){
    let txt = document.querySelector(".signintxt");
    txt.innerText = "Logout"
    if(txt.innerText == "Logout"){
        document.getElementById("inoutbtn").addEventListener("click", cleardata)

        function cleardata(event){
            localStorage.removeItem("token")
        }
    }
}
