function Draw(circles, radius = 5, width = 300, height = 300, color = foreground) {
  const drawingCtx = DOM.context2d(width, height);
  
  // Fill background
  drawingCtx.fillStyle = background;
  drawingCtx.fillRect(0, 0, width, height);
  
  drawingCtx.fillStyle = color;
  for (const circle of circles) {
    drawingCtx.beginPath();
    drawingCtx.arc(circle.x, circle.y, circle.radius / 2 / radiusDrawMultiplier, 0, Math.PI * 2);
    drawingCtx.fill();
  }
  
  // Draw outer frame.
  drawingCtx.strokeStyle = 'gainsboro';
  drawingCtx.strokeRect(0, 0, width, height);
  
  return drawingCtx.canvas;
}