// Get the canvas and drawing context
const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

// Store points as objects: { x, y, label }
const points = [];

const POINT_RADIUS = 6;
let draggingPoint = null;
let isDragging = false;

// Helper: get mouse position relative to canvas
function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

// Helper: find a point near a given position (for click/drag)
function findPointAtPosition(pos) {
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    const dx = p.x - pos.x;
    const dy = p.y - pos.y;
    const distSq = dx * dx + dy * dy;
    if (distSq <= POINT_RADIUS * POINT_RADIUS * 2) {
      return p;
    }
  }
  return null;
}

// Draw axes and labels
function drawAxes() {
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  ctx.clearRect(0, 0, w, h);

  ctx.save();

  // Axis lines
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 1.2;

  // X-axis (horizontal)
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(w, cy);
  ctx.stroke();

  // Y-axis (vertical)
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, h);
  ctx.stroke();

  // Arrowheads for X-axis
  ctx.beginPath();
  ctx.moveTo(w - 12, cy - 6);
  ctx.lineTo(w, cy);
  ctx.lineTo(w - 12, cy + 6);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(12, cy - 6);
  ctx.lineTo(0, cy);
  ctx.lineTo(12, cy + 6);
  ctx.stroke();

  // Arrowheads for Y-axis
  ctx.beginPath();
  ctx.moveTo(cx - 6, 12);
  ctx.lineTo(cx, 0);
  ctx.lineTo(cx + 6, 12);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 6, h - 12);
  ctx.lineTo(cx, h);
  ctx.lineTo(cx + 6, h - 12);
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = "#222";
  ctx.font = "14px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  // X-axis: Techno (left) -> Poetics (right)
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Techno", 10, cy + 18);

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("Poetics", w - 10, cy + 18);

  // Y-axis: Local (top) -> Cosmo (bottom)
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Local", cx, 8);

  ctx.textBaseline = "bottom";
  ctx.fillText("Cosmo", cx, h - 8);

  ctx.restore();
}

// Draw all points and their labels
function drawPoints() {
  ctx.save();
  ctx.font = "13px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textBaseline = "bottom";

  points.forEach((p) => {
    // point
    ctx.beginPath();
    ctx.arc(p.x, p.y, POINT_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#1f6feb";
    ctx.fill();
    ctx.strokeStyle = "#153b7b";
    ctx.stroke();

    // label (always visible)
    ctx.fillStyle = "#111";
    ctx.textAlign = "left";
    ctx.fillText(p.label, p.x + POINT_RADIUS + 4, p.y - POINT_RADIUS - 2);
  });

  ctx.restore();
}

// Redraw everything
function redraw() {
  drawAxes();
  drawPoints();
}

// Add or edit/delete on click
canvas.addEventListener("click", (evt) => {
  // If we just dragged, ignore click
  if (isDragging) return;

  const pos = getMousePos(evt);
  const existing = findPointAtPosition(pos);

  if (existing) {
    // Edit or delete existing point
    const result = window.prompt(
      "Edit label, or type DELETE to remove this point:",
      existing.label
    );

    if (result === null) {
      // User cancelled
      return;
    }

    const trimmed = result.trim();

    if (trimmed.toUpperCase() === "DELETE") {
      const idx = points.indexOf(existing);
      if (idx !== -1) {
        points.splice(idx, 1);
        redraw();
      }
      return;
    }

    if (trimmed.length > 0) {
      existing.label = trimmed;
      redraw();
    }

  } else {
    // Create new point
    const label = window.prompt("Label for this point:");

    if (label === null) {
      // User cancelled
      return;
    }

    const trimmed = label.trim();
    if (trimmed.length === 0) {
      // Ignore empty labels
      return;
    }

    points.push({
      x: pos.x,
      y: pos.y,
      label: trimmed,
    });

    redraw();
  }
});

// Dragging behavior
canvas.addEventListener("mousedown", (evt) => {
  const pos = getMousePos(evt);
  const p = findPointAtPosition(pos);

  if (p) {
    draggingPoint = p;
    isDragging = true;
    canvas.style.cursor = "grabbing";
  }
});

canvas.addEventListener("mousemove", (evt) => {
  const pos = getMousePos(evt);

  if (isDragging && draggingPoint) {
    // Move point with the mouse
    draggingPoint.x = pos.x;
    draggingPoint.y = pos.y;
    redraw();
  } else {
    // Hover feedback
    const p = findPointAtPosition(pos);
    canvas.style.cursor = p ? "pointer" : "crosshair";
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
  draggingPoint = null;
  canvas.style.cursor = "crosshair";
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
  draggingPoint = null;
  canvas.style.cursor = "crosshair";
});

// Initial draw
redraw();

