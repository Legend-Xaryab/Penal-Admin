let selected = [];
let total = 0;

fetch("/api/services")
.then(r=>r.json())
.then(data=>{
 services.innerHTML = data.map(s=>`
  <div class="card">
   <input type="checkbox" onchange="toggle('${s.name}',${s.price},this)">
   ${s.name} – Rs ${s.price}
  </div>`).join("");
});

function toggle(name, price, el){
 if(el.checked){ selected.push(name); total+=price; }
 else{ selected=selected.filter(s=>s!==name); total-=price; }
 document.getElementById("total").innerText = "Total: Rs " + total;
}

orderForm.onsubmit = e => {
 e.preventDefault();
 const fd = new FormData(orderForm);
 fd.append("services", JSON.stringify(selected));
 fd.append("total", total);

 fetch("/api/order",{ method:"POST", body:fd })
 .then(r=>r.json())
 .then(d=>location.href=d.whatsapp);
};
