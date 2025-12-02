// Transdisciplinary Engagement Map
// Click to add labeled points; drag to move; click existing points to rename or delete.

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('mapCanvas');
  if (!canvas) {
    console.error('Canvas with id "mapCanvas" not found.');
    return;
  }

  const ctx = canvas.getContext('2d');

  // If width/height are set in HTML, we use those. Otherwise, fall back to 600x600.
  if (!canvas.width) canvas.width = 600;
  if (!canvas.height) canvas.height = 600;

  const width = canvas.width;
  const height = canvas.height;
  const margin = 60;
  const origin = { x: width / 2, y: height / 2 };
  const pointRadius = 6;

  const points = []; // { x, y, label }

  let hoverIndex = null;
  let isMouseDown = false;
  let dragIndex = null;
  let didDrag = false;

  function clearCanvas() {
    ctx.clearRect(0, 0, width, height);
  }

  function drawAxes() {
    ctx.save();

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;

    // X-axis (Techno <-> Poetics)
    ctx.beginPath();
    ctx.moveTo(margin, origin.y);
    ctx.lineTo(width - margin, origin.y);
    ctx.stroke();

    // Y-axis (Local <-> Cosmo)
    ctx.beginPath();
    ctx.moveTo(origin.x, margin);
    ctx.lineTo(origin.x, height - margin);
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.font = '14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    // X-axis labels: Techno (left) / Poetics (right)
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Techno', margin + 4, origin.y + 8);

    ctx.textAlign = 'right';
    ctx.fillText('Poetics', width - margin - 4, origin.y + 8);

    // Y-axis labels: Local (top) / Cosmo (bottom)
    ctx.textAlign = 'center';

    // Local at top
    ctx.textBaseline = 'top';
    ctx.fillText('Local', origin.x + 8, margin + 4);

    // Cosmo at bottom
    ctx.textBaseline = 'bottom';
    ctx.fillText('Cosmo', origin.x + 8, height - margin - 4);

    ctx.restore();
  }

  function drawPoints() {
    ctx.save();
    ctx.font = '12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textBaseline = 'middle';

    points.forEach((pt, index) => {
      // Point
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pointRadius, 0, Math.PI * 2);
      ctx.fillStyle = index === hoverIndex ? '#007acc' : '#111';
      ctx.fill();

      // Label
      ctx.fillStyle = '#111';
      ctx.textAlign = 'left';
      ctx.fillText(pt.label, pt.x + pointRadius + 6, pt.y);
    });

    ctx.restore();
  }

  function draw() {
    clearCanvas();
    drawAxes();
    drawPoints();
  }

  function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  function findPointAt(x, y) {
    for (let i = points.length - 1; i >= 0; i--) {
      const pt = points[i];
      const dx = x - pt.x;
      const dy = y - pt.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= pointRadius + 6) {
        return i;
      }
    }
    return null;
  }

  // --- Mouse interactions ---

  canvas.addEventListener('mousemove', (evt) => {
    const { x, y } = getMousePos(evt);

    if (isMouseDown && dragIndex !== null) {
      // Dragging an existing point
      didDrag = true;
      points[dragIndex].x = x;
      points[dragIndex].y = y;
      draw();
      return;
    }

    // Hover detection
    const idx = findPointAt(x, y);
    hoverIndex = idx;
    canvas.style.cursor = idx !== null ? 'pointer' : 'crosshair';
    draw();
  });

  canvas.addEventListener('mousedown', (evt) => {
    const { x, y } = getMousePos(evt);
    isMouseDown = true;
    didDrag = false;

    const idx = findPointAt(x, y);
    dragIndex = idx;
  });

  canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
    dragIndex = null;
  });

  canvas.addEventListener('mouseleave', () => {
    isMouseDown = false;
    dragIndex = null;
    hoverIndex = null;
    didDrag = false;
    canvas.style.cursor = 'crosshair';
    draw();
  });

  canvas.addEventListener('click', (evt) => {
    const { x, y } = getMousePos(evt);

    // If we just dragged, swallow the click so it doesn't open the edit prompt.
    if (didDrag) {
      didDrag = false;
      return;
    }

    const idx = findPointAt(x, y);

    if (idx !== null) {
      // Edit / delete existing point
      const current = points[idx].label || '';
      const response = window.prompt(
        'Edit the label for this point, or type DELETE to remove it:',
        current
      );

      if (response === null) return; // user cancelled

      const trimmed = response.trim();
      if (trimmed.toUpperCase() === 'DELETE') {
        points.splice(idx, 1);
      } else if (trimmed !== '') {
        points[idx].label = trimmed;
      }
      draw();
    } else {
      // Create a new point
      const label = window.prompt('Label for this point:');
      if (label === null) return;

      const trimmed = label.trim();
      if (trimmed === '') return;

      points.push({ x, y, label: trimmed });
      draw();
    }
  });

  // Initial draw
  draw();
});
