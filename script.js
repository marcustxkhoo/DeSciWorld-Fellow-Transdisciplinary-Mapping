<script>
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const POINT_RADIUS = 6;
  const points = [];

  let isDragging = false;
  let draggingPoint = null;

  function drawAxes() {
    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;

    // Clear & background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Axes
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;

    // X axis (Technos ↔ Poetics)
    ctx.beginPath();
    ctx.moveTo(40, centerY);
    ctx.lineTo(w - 40, centerY);
    ctx.stroke();

    // X axis arrowheads
    ctx.beginPath();
    ctx.moveTo(w - 45, centerY - 5);
    ctx.lineTo(w - 40, centerY);
    ctx.lineTo(w - 45, centerY + 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(45, centerY - 5);
    ctx.lineTo(40, centerY);
    ctx.lineTo(45, centerY + 5);
    ctx.stroke();

    // Y axis (Local ↔ Cosmo)
    ctx.beginPath();
    ctx.moveTo(centerX, 40);
    ctx.lineTo(centerX, h - 40);
    ctx.stroke();

    // Y axis arrowheads
    ctx.beginPath();
    ctx.moveTo(centerX - 5, 45);
    ctx.lineTo(centerX, 40);
    ctx.lineTo(centerX + 5, 45);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - 5, h - 45);
    ctx.lineTo(centerX, h - 40);
    ctx.lineTo(centerX + 5, h - 45);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = "#000000";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";

    // Y axis continuum: Local (top), Cosmo (bottom)
    ctx.fillText("LOCAL", centerX, 25);
    ctx.fillText("COSMO", centerX, h - 15);
