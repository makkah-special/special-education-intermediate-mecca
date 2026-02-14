// dashboard.js
(function(){
  const $ = (id) => document.getElementById(id);

  const rowsEl = $("rows");
  const qEl = $("q");
  const bldEl = $("bld");
  const gradeEl = $("grade");
  const onlyEl = $("only");
  const resetEl = $("reset");
  const exportEl = $("export");

  const statClasses = $("statClasses");
  const statYaseer = $("statYaseer");
  const statPending = $("statPending");
  const statTotal = $("statTotal");
  $("year").textContent = new Date().getFullYear();

  const DATA = Array.isArray(window.DASHBOARD_DATA) ? window.DASHBOARD_DATA : [];

  function normalize(s){
    return (s ?? "").toString().trim().toLowerCase();
  }

  function statusChip(item){
    const y = Number(item.yaseer||0);
    const p = Number(item.pending||0);
    if (y > 0) return `<span class="chip ok">✅ يوجد يسير</span>`;
    if (p > 0) return `<span class="chip warn">⏳ بانتظار</span>`;
    return `<span class="chip">—</span>`;
  }

  function rowClass(item){
    return (Number(item.yaseer||0) > 0) ? "has-yaseer" : "no-yaseer";
  }

  function render(list){
    rowsEl.innerHTML = list.map(item => `
      <tr class="${rowClass(item)}">
        <td class="num">${item.classroom}</td>
        <td>${item.building}</td>
        <td>${item.grade}</td>
        <td class="num">${Number(item.yaseer||0)}</td>
        <td class="num">${Number(item.pending||0)}</td>
        <td class="num">${Number(item.total||0)}</td>
        <td>${statusChip(item)}</td>
      </tr>
    `).join("");

    statClasses.textContent = list.length;
    statYaseer.textContent = list.reduce((a,x)=>a+Number(x.yaseer||0),0);
    statPending.textContent = list.reduce((a,x)=>a+Number(x.pending||0),0);
    statTotal.textContent = list.reduce((a,x)=>a+Number(x.total||0),0);
  }

  function applyFilters(){
    const q = normalize(qEl.value);
    const b = bldEl.value;
    const g = gradeEl.value;
    const only = onlyEl.value;

    let list = DATA.slice();

    if (b) list = list.filter(x => x.building === b);
    if (g) list = list.filter(x => x.grade === g);

    if (only === "has") list = list.filter(x => Number(x.yaseer||0) > 0);
    if (only === "none") list = list.filter(x => Number(x.yaseer||0) === 0);

    if (q){
      list = list.filter(x => normalize(`${x.classroom} ${x.building} ${x.grade}`).includes(q));
    }

    render(list);
  }

  function reset(){
    qEl.value = "";
    bldEl.value = "";
    gradeEl.value = "";
    onlyEl.value = "all";
    applyFilters();
  }

  function exportCSV(){
    // فلترة مثل العرض
    const q = normalize(qEl.value);
    const b = bldEl.value;
    const g = gradeEl.value;
    const only = onlyEl.value;

    let list = DATA.slice();
    if (b) list = list.filter(x => x.building === b);
    if (g) list = list.filter(x => x.grade === g);
    if (only === "has") list = list.filter(x => Number(x.yaseer||0) > 0);
    if (only === "none") list = list.filter(x => Number(x.yaseer||0) === 0);
    if (q) list = list.filter(x => normalize(`${x.classroom} ${x.building} ${x.grade}`).includes(q));

    const header = ["الفصل","المبنى","الصف","طلاب يسير","بانتظار التشخيص","إجمالي الفصل"];
    const lines = [
      header.join(","),
      ...list.map(x => [
        x.classroom, x.building, x.grade,
        Number(x.yaseer||0), Number(x.pending||0), Number(x.total||0)
      ].map(v => `"${String(v).replaceAll('"','""')}"`).join(","))
    ];

    const blob = new Blob([lines.join("\n")], { type:"text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yaseer-dashboard.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  [qEl,bldEl,gradeEl,onlyEl].forEach(el => el.addEventListener("input", applyFilters));
  resetEl.addEventListener("click", reset);
  exportEl.addEventListener("click", exportCSV);

  applyFilters();
})();
