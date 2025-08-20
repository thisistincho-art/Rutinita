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
      const avgNum = val.length>0 ? (val.slice(-6).reduce((a,b)=>a+b,0)/Math.min(6,val.length)).toFixed(1) : '-';
      li.innerHTML += `Serie ${s+1}: <input type="number" min="0" placeholder="reps" data-key="${key}"> <span class="avg">${avgNum}</span><br>`;
    }

    const sumDiv = document.createElement('div');
    sumDiv.classList.add('sum-reps');
    sumDiv.textContent = 'Total reps: 0 (-)'; // X (Y)
    li.appendChild(sumDiv);

    lista.appendChild(li);

    function actualizarSumatoria(ejLi, keyBase) {
      const inputs = Array.from(ejLi.querySelectorAll('input'));
      const sumDiv = ejLi.querySelector('.sum-reps');
      let total = 0;
      let historialSum = [];
      inputs.forEach((inp, idx) => {
        const k = `${keyBase}-s${idx}`;
        const val = parseInt(inp.value) || 0;
        total += val;
        if(historial[k]) historialSum.push(...historial[k].slice(-6));
      });
      const avgTotal = historialSum.length > 0 ? (historialSum.reduce((a,b)=>a+b,0)/historialSum.length).toFixed(1) : '-';
      sumDiv.textContent = `Total reps: ${total} (${avgTotal})`;
    }

    li.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', e=>{
        const key = input.dataset.key;
        const v = parseInt(e.target.value);
        if(!historial[key]) historial[key]=[];
        if(v) historial[key].push(v);
        localStorage.setItem('historial', JSON.stringify(historial));
        actualizarSumatoria(li, ej.nombre);

        // actualizar solo el número del promedio
        const val = historial[key] || [];
        const avgNum = val.length>0 ? (val.slice(-6).reduce((a,b)=>a+b,0)/Math.min(6,val.length)).toFixed(1) : '-';
        input.nextElementSibling.textContent = avgNum;
      });
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

document.getElementById('cargar-btn').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(evt){
    try {
      const data = JSON.parse(evt.target.result);
      localStorage.setItem('historial', JSON.stringify(data));
      alert("Historial cargado!");
      location.reload();
    } catch(err){
      alert("Archivo inválido");
    }
  };
  reader.readAsText(file);
});

document.getElementById('fullscreen-btn').addEventListener('click', () => {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.webkitRequestFullscreen) { 
    document.documentElement.webkitRequestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) { 
    document.documentElement.msRequestFullscreen();
  }
});

cargarRutina();
