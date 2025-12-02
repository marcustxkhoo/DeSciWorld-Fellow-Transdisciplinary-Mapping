// --- CONFIG & STATE -------------------------------------------------

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;
const margin = 60;

const centerX = width / 2;
const centerY = height / 2;

const points = []; // { x, y, label, tag }

let draggingPoint = null;
let dragStart = null;
let didDrag = false;

// For modal usage:
let modalMode = "add"; // "add" or "edit"
let modalTargetPoint = null;
let pendingAddPosition = null;

// Phrase selection
const projectPhrases = [
  "collective intelligence",
  "metabolic engineering",
  "posthuman",
  "biotic game",
  "somatic epistemologies",
  "decentralized human rights",
  "writing",
  "decentralized",
  "educational platform",
  "wood archaeology",
  "inter-constituent collaboration"
];
let activePhrase = null;

// Filters
const filterPersonal = document.getElementById("filterPersonal");
const filterResearch = document.getElementById("filterResearch");
const filterKeyPhrase = document.getElementById("filterKeyPhrase");

// Modal elements
const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalLabelInput = document.getElementById("modalLabelInput");
const modalDeleteBtn = document.getElementById("modalDeleteBtn");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const modalSaveBtn = document.getElementById("modalSaveBtn");
const modalKeyPhraseOption = document.getElementById("modalKeyPhraseOption");

const phrasesContainer = document.getElementById("phrasesContainer");

// --- INITIAL SETUP --------------------------------------------------

// Build phrase buttons
projectPhrases.forEach((phrase) => {
  const btn = document.createElement("button");
  btn.className = "phrase-btn";
  btn.textContent = phrase;
  btn.dataset.phrase = phrase;

  btn.addEventListener("click", () => {
    if (activePhrase === phrase) {
      activePhrase = null;
    } else {
      activePhrase = phrase;
    }
    refreshPhraseButtons();
  });

  phrasesContainer.appendChild(btn);
});

function refreshPhraseButtons() {
  const buttons = document.querySelectorAll(".phrase-btn");
  buttons.forEach((btn) => {
    if (btn.dataset.phrase === activePhrase) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// Redraw when filters change
[filterPersonal, filterResearch, filterKeyPhrase].forEach((checkbox) =>
  checkbox.addEventListener("change", draw)
);

// --- DRAWING --------------------------------------------------------

function drawAxes() {
  ctx.clearRect(0, 0, width, height);

  // Axis lines
  ctx.strokeStyle = "#999";
  ctx.lineWidth = 1.2;

  // X-axis (Techno <-> Poetics)
  ctx.beginPath();
  ctx.moveTo(margin, centerY);
  ctx.lineTo(width - margin, centerY);
  ctx.stroke();

  // Y-axis (Local <-> Cosmo)
  ctx.beginPath();
  ctx.moveTo(centerX, margin);
  ctx.lineTo(centerX, height - margin);
  ctx.stroke();

  // Axis labels on the plane edges
  ctx.fillStyle = "#444";
  ctx.font = "13px system-ui";

  // X axis: Techno (left), Poetics (right)
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText("Techno", margin + 4, centerY - 6);

  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("Poetics", width - margin - 4, centerY - 6);

  // Y axis: Local (top, above the plane), Cosmo (bottom, below the plane)
  ctx.textAlign = "center";

  // Local above the plane
  ctx.textBaseline = "bottom";
  ctx.fillText("Local", centerX, margin - 14);

  // Cosmo below the plane
  ctx.textBaseline = "top";
  ctx.fillText("Cosmo", centerX, height - margin + 14);
}

function drawPoints() {
  const showPersonal = filterPersonal.checked;
  const showResearch = filterResearch.checked;
  const showKeyPhrase = filterKeyPhrase.checked;

  points.forEach((p) => {
    const tag = p.tag || "Personal Trait";

    if (
      (tag === "Personal Trait" && !showPersonal) ||
      (tag === "Research Project Trait" && !showResearch) ||
      (tag === "Project Key Phrase" && !showKeyPhrase)
    ) {
      return; // filtered out
    }

    // Point
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = tagColor(tag);
    ctx.fill();

    // Label
    ctx.font = "12px system-ui";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#222";
    ctx.fillText(p.label || "", p.x + 8, p.y + 4);
  });
}

function draw() {
  drawAxes();
  drawPoints();
}

function tagColor(tag) {
  switch (tag) {
    case "Personal Trait":
      return "#2c7be5"; // blue
    case "Research Project Trait":
      return "#e67e22"; // orange
    case "Project Key Phrase":
      return "#9b59b6"; // purple
    default:
      return "#555";
  }
}

// --- POINT HIT TESTING ----------------------------------------------

function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((evt.clientX - rect.left) / rect.width) * canvas.width,
    y: ((evt.clientY - rect.top) / rect.height) * canvas.height
  };
}

function getPointAtPosition(x, y) {
  const radius = 8;
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    const dx = p.x - x;
    const dy = p.y - y;
    if (dx * dx + dy * dy <= radius * radius) {
      return p;
    }
  }
  return null;
}

// --- MODAL LOGIC ----------------------------------------------------

function openModal({ mode, point = null, position = null, isFromPhrase = false }) {
  modalMode = mode;
  modalTargetPoint = point;
  pendingAddPosition = position;

  // Show/Hide delete button based on mode
  if (mode === "edit") {
    modalTitle.textContent = "Edit Point";
    modalDeleteBtn.style.display = "inline-block";
    modalLabelInput.value = point.label || "";
  } else {
    modalTitle.textContent = "Add Point";
    modalDeleteBtn.style.display = "none";
    modalLabelInput.value = point && point.label ? point.label : "";
  }

  // Tag radio options
  const radios = document.querySelectorAll('input[name="modalTag"]');

  if (isFromPhrase) {
    // If adding from Project Key Phrase, show that option and preselect it
    modalKeyPhraseOption.style.display = "";
    radios.forEach((r) => {
      if (r.value === "Project Key Phrase") {
        r.checked = true;
      } else {
        r.checked = false;
      }
    });
  } else if (mode === "edit" && point) {
    modalKeyPhraseOption.style.display = "";
    radios.forEach((r) => {
      r.checked = r.value === (point.tag || "Personal Trait");
    });
  } else {
    // New point from click, not phrase
    modalKeyPhraseOption.style.display = "";
    radios.forEach((r) => {
      r.checked = r.value === "Personal Trait";
    });
  }

  modalBackdrop.style.display = "flex";
  modalLabelInput.focus();
  modalLabelInput.select();
}

function closeModal() {
  modalBackdrop.style.display = "none";
  modalTargetPoint = null;
  pendingAddPosition = null;
}

// Save button
modalSaveBtn.addEventListener("click", () => {
  const label = modalLabelInput.value.trim();
  if (!label) {
    alert("Please enter a label for this point.");
    return;
  }

  const tagRadio = document.querySelector('input[name="modalTag"]:checked');
  const tag = tagRadio ? tagRadio.value : "Personal Trait";

  if (modalMode === "add" && pendingAddPosition) {
    points.push({
      x: pendingAddPosition.x,
      y: pendingAddPosition.y,
      label,
      tag
    });
  } else if (modalMode === "edit" && modalTargetPoint) {
    modalTargetPoint.label = label;
    modalTargetPoint.tag = tag;
  }

  closeModal();
  draw();
});

// Cancel button
modalCancelBtn.addEventListener("click", () => {
  closeModal();
});

// Delete button
modalDeleteBtn.addEventListener("click", () => {
  if (modalTargetPoint) {
    const index = points.indexOf(modalTargetPoint);
    if (index !== -1) {
      points.splice(index, 1);
    }
  }
  closeModal();
  draw();
});

// Close modal by clicking backdrop (optional)
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) {
    closeModal();
  }
});

// --- MOUSE INTERACTION ----------------------------------------------

canvas.addEventListener("mousedown", (evt) => {
  const pos = getMousePos(evt);
  const p = getPointAtPosition(pos.x, pos.y);

  if (p) {
    draggingPoint = p;
    dragStart = pos;
    didDrag = false;
  } else {
    draggingPoint = null;
    dragStart = pos;
    didDrag = false;
  }
});

canvas.addEventListener("mousemove", (evt) => {
  if (!draggingPoint) return;

  const pos = getMousePos(evt);
  const dx = pos.x - dragStart.x;
  const dy = pos.y - dragStart.y;

  if (!didDrag && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
    didDrag = true;
  }

  if (didDrag) {
    draggingPoint.x = pos.x;
    draggingPoint.y = pos.y;
    draw();
  }
});

canvas.addEventListener("mouseup", (evt) => {
  const pos = getMousePos(evt);
  const clickedPoint = getPointAtPosition(pos.x, pos.y);
  const wasDraggingPoint = draggingPoint;

  const smallMovement =
    dragStart &&
    Math.abs(pos.x - dragStart.x) < 3 &&
    Math.abs(pos.y - dragStart.y) < 3;

  // If we had a point selected for dragging and we barely moved: treat as click
  if (wasDraggingPoint && !didDrag && smallMovement) {
    openModal({
      mode: "edit",
      point: wasDraggingPoint,
      isFromPhrase: wasDraggingPoint.tag === "Project Key Phrase"
    });
  } else if (!wasDraggingPoint && smallMovement) {
    // Click on empty area: create new point
    if (activePhrase) {
      // When a phrase is active, auto-use its label and tag as Project Key Phrase,
      // but still allow user to tweak / confirm via modal.
      const defaultPoint = {
        label: activePhrase,
        tag: "Project Key Phrase"
      };
      openModal({
        mode: "add",
        point: defaultPoint,
        position: pos,
        isFromPhrase: true
      });
      modalLabelInput.value = activePhrase;
    } else {
      // Normal add
      openModal({
        mode: "add",
        position: pos,
        isFromPhrase: false
      });
    }
  }

  draggingPoint = null;
  dragStart = null;
  didDrag = false;
});

canvas.addEventListener("mouseleave", () => {
  draggingPoint = null;
  dragStart = null;
  didDrag = false;
});

// --- INITIAL DRAW ---------------------------------------------------

draw();


