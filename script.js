async function cargarRutina() {
  const res = await fetch("rutina.json");
  const data = await res.json();
  const lista = document.getElementById("lista-ejercicios");

  const historial = JSON.parse(localStorage.getItem('historial')) || {};

  data.ejercicios.forEach((ej) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${ej.nombre}</strong><br>`;

    for (let s=0; s<ej.series; s++) {
      const key = `${ej.nombre}-s${s}`;
      const val = historial[key] || [];
      const avg = val.length>0 ? (val.slice(-14).reduce((a,b)=>a+b,0)/Math.min(14,val.length)).toFixed(1) : '-';
      li.innerHTML += `Serie ${s+1}: <input type="number" min="0" placeholder="reps" data-key="${key}"> (Prom 2w: <span class="avg">${avg}</span>)<br>`;
    }

    lista.appendChild(li);
  });

  lista.querySelectorAll('input').forEach(input => {
    const key = input.dataset.key;
    input.value = historial[key]?.slice(-1)[0] || '';
    input.addEventListener('change', e => {
      const v = parseInt(e.target.value);
      if (!v) return;
      if (!historial[key]) historial[key]=[];
      historial[key].push(v);
      localStorage.setItem('historial', JSON.stringify(historial));

      const avgEl = e.target.nextElementSibling;
      avgEl.textContent = (historial[key].slice(-14).reduce((a,b)=>a+b,0)/Math.min(14,historial[key].length)).toFixed(1);
    });
  });
}

document.getElementById('export-btn').addEventListener('click', ()=>{
  const historial = JSON.parse(localStorage.getItem('historial')||'{}');
  const blob = new Blob([JSON.stringify(historial, null,2)], {type:"application/json"});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'historial.json';
  a.click();
});

cargarRutina();
