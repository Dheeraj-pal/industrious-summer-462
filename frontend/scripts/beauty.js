let url = "https://zany-rose-lemming-veil.cyclic.app/products";

async function getData() {
  try {
    let res = await fetch(url, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    let out = await res.json();
    filtercountry(out);
  } catch (error) {
    alert(error);
  }
}

getData();

function filtercountry(out) {
  let beautyData = out.filter(function (data) {
    return data.category == "Beauty";
  });
  displayData(beautyData);
}

function displayData(beautyData) {
  let count = 0;
  document.getElementById("product-cart").innerHTML = "";

  beautyData.forEach((data) => {
    let divcart = document.createElement("div");
    divcart.classList.add("divpointer")
    divcart.addEventListener("click",function(){
      setData(data)
    document.location.href="details.html";
    });

    let image = document.createElement("img");
    image.src = data.img;

    let title = document.createElement("h6");
    title.innerText = data.title.substring(0, 55);

    let reviews = document.createElement("p");
    reviews.innerText = data.review;

    let cost = document.createElement("h5");
    cost.innerText = data.price;

    let btn = document.createElement("button");
    btn.innerText = "Show Details";
    btn.classList.add("details-btn");
    

    divcart.append(image, title, reviews, cost, btn);
    document.getElementById("product-cart").append(divcart);
    count++;
  });

  console.log(count);
  displayResult(count);
}

function displayResult(count) {
  document.getElementById("countResult").innerHTML = "";

  let txt = document.createElement("P");
  txt.innerText = count + " Results";

  document.getElementById("countResult").append(txt);
}

function setData(el){
  let productData =[];
  productData.push(el);
  console.log(productData)
  localStorage.setItem("local_Key",JSON.stringify(productData));
}

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
