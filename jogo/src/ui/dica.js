const el = () => document.getElementById("tooltip");

export function mostrarDica(html, x, y) {
  const t = el();
  t.innerHTML = html;
  t.style.display = "block";
  const larg = t.offsetWidth;
  const px = Math.min(x + 16, window.innerWidth - larg - 8);
  t.style.left = px + "px";
  t.style.top = Math.max(8, y - 10) + "px";
}

export function esconderDica() {
  el().style.display = "none";
}
