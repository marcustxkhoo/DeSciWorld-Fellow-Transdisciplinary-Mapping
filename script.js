const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

// draw axes
function drawAxes() {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "#999";
  ctx.lineWidth = 1;

  // X axis
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Y axis
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
}

drawAxes();

// user-placed points
let points = [];

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // save point
  points.push({ x, y });

  // redraw axes + points
  drawAxes();
  points.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
  });
});
