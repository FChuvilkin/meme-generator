// Canvas and context
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');

// UI elements
const imageInput = document.getElementById('imageInput');
const addTextBtn = document.getElementById('addTextBtn');
const textInput = document.getElementById('textInput');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const fontSizeValue = document.getElementById('fontSizeValue');
const textColorPicker = document.getElementById('textColorPicker');
const deleteTextBtn = document.getElementById('deleteTextBtn');
const downloadBtn = document.getElementById('downloadBtn');
const textControls = document.getElementById('textControls');
const canvasPlaceholder = document.getElementById('canvasPlaceholder');
const templateGallery = document.getElementById('templateGallery');

// State
let image = null;
let textBoxes = [];
let selectedTextBox = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// Initialize
imageInput.addEventListener('change', handleImageUpload);
addTextBtn.addEventListener('click', addTextBox);
textInput.addEventListener('input', updateTextBoxText);
fontSizeSlider.addEventListener('input', updateTextBoxFontSize);
textColorPicker.addEventListener('input', updateTextBoxColor);
deleteTextBtn.addEventListener('click', deleteSelectedTextBox);
downloadBtn.addEventListener('click', downloadMeme);

// Canvas event listeners
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseleave', handleMouseUp);

// Touch events for mobile
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

// Keyboard event listener for deleting selected textbox
document.addEventListener('keydown', function(e) {
    // Delete textbox when Backspace or Delete is pressed and a textbox is selected
    if ((e.key === 'Backspace' || e.key === 'Delete') && selectedTextBox !== null) {
        // Don't delete if user is typing in the textarea
        if (document.activeElement !== textInput) {
            e.preventDefault();
            deleteSelectedTextBox();
        }
    }
});

// Template images
const templateImages = [
    'assets/9d4547330630963a9562c2ce895544b9.jpg',
    'assets/best-meme-templates-04.avif',
    'assets/no-yes-businessman-meme-pinup-260nw-2373493139.webp',
    'assets/sad-pepe-the-frog-768x768-1.webp'
];

// Initialize template gallery
initializeTemplateGallery();

function loadImageFromSource(src) {
    // Clear text boxes immediately when switching templates
    textBoxes = [];
    selectedTextBox = null;
    textControls.style.display = 'none';
    textInput.value = '';
    
    // Clear canvas immediately to remove any previous text
    if (canvas.width > 0 && canvas.height > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    const img = new Image();
    img.onload = function() {
        image = img;
        setupCanvas();
        drawCanvas();
        canvasPlaceholder.classList.add('hidden');
        canvas.style.display = 'block';
        downloadBtn.disabled = false;
    };
    img.onerror = function() {
        alert('Failed to load image. Please try another template or upload your own image.');
    };
    img.src = src;
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        loadImageFromSource(event.target.result);
    };
    reader.readAsDataURL(file);
}

function initializeTemplateGallery() {
    templateImages.forEach((templatePath, index) => {
        const templateItem = document.createElement('div');
        templateItem.className = 'template-item';
        templateItem.setAttribute('data-index', index);
        
        const templateImg = document.createElement('img');
        templateImg.src = templatePath;
        templateImg.alt = `Template ${index + 1}`;
        templateImg.className = 'template-img';
        
        templateItem.appendChild(templateImg);
        templateItem.addEventListener('click', () => {
            loadImageFromSource(templatePath);
            // Update active state
            document.querySelectorAll('.template-item').forEach(item => {
                item.classList.remove('active');
            });
            templateItem.classList.add('active');
        });
        
        templateGallery.appendChild(templateItem);
    });
}

function setupCanvas() {
    if (!image) return;

    // Calculate available space (viewport minus sidebar and floating toolbar)
    const sidebarWidth = 240; // Match CSS variable --sidebar-width
    const toolbarHeight = 72; // Match CSS variable --toolbar-height
    const padding = 32; // Match canvas-wrapper padding (--spacing-xl = 2rem = 32px)
    const toolbarSpacing = 24; // Match floating toolbar bottom spacing (--spacing-lg = 1.5rem = 24px)
    
    const availableWidth = window.innerWidth - sidebarWidth - (padding * 2);
    const availableHeight = window.innerHeight - toolbarHeight - toolbarSpacing - (padding * 2);
    
    // Calculate scale to fit available space while maintaining aspect ratio
    const imageAspectRatio = image.width / image.height;
    const availableAspectRatio = availableWidth / availableHeight;
    
    let width, height;
    
    if (imageAspectRatio > availableAspectRatio) {
        // Image is wider - fit to width (scale up if image is smaller)
        width = availableWidth;
        height = width / imageAspectRatio;
    } else {
        // Image is taller - fit to height (scale up if image is smaller)
        height = availableHeight;
        width = height * imageAspectRatio;
    }
    
    // Ensure minimum size
    if (width < 200) {
        width = 200;
        height = width / imageAspectRatio;
    }
    if (height < 200) {
        height = 200;
        width = height * imageAspectRatio;
    }
    
    canvas.width = width;
    canvas.height = height;
}

// Handle window resize
window.addEventListener('resize', () => {
    if (image) {
        setupCanvas();
        drawCanvas();
    }
});

function drawCanvas() {
    if (!image) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Draw all text boxes
    textBoxes.forEach((textBox, index) => {
        drawTextBox(textBox, index === selectedTextBox);
    });
}

function getTextMetrics(textBox, ctx) {
    const lines = textBox.text.split('\n');
    let maxLineWidth = 0;
    
    lines.forEach(line => {
        const metrics = ctx.measureText(line);
        if (metrics.width > maxLineWidth) {
            maxLineWidth = metrics.width;
        }
    });
    
    const lineHeight = textBox.fontSize * 1.4;
    const totalHeight = lines.length * lineHeight;
    
    return {
        lines,
        width: maxLineWidth,
        height: totalHeight,
        lineHeight
    };
}

function drawTextBox(textBox, isSelected) {
    ctx.save();
    
    // Set font
    ctx.font = `${textBox.fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Split text by newlines
    const lines = textBox.text.split('\n');
    const lineHeight = textBox.fontSize * 1.4;
    const totalHeight = lines.length * lineHeight;
    
    // Calculate starting Y position (centered vertically)
    const startY = textBox.y - totalHeight / 2 + lineHeight / 2;
    
    // Draw each line with stroke and fill
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    
    ctx.fillStyle = textBox.color || '#ffffff';
    
    lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        ctx.strokeText(line, textBox.x, y);
        ctx.fillText(line, textBox.x, y);
    });
    
    // Draw selection indicator
    if (isSelected) {
        let maxLineWidth = 0;
        lines.forEach(line => {
            const metrics = ctx.measureText(line);
            if (metrics.width > maxLineWidth) {
                maxLineWidth = metrics.width;
            }
        });
        
        // Calculate actual text bounds based on where text is drawn
        // With textBaseline = 'top', startY is the top of the first line
        // Each line has fontSize height, with lineHeight spacing between them
        const textTop = startY;
        // For the bottom, we need the bottom of the last line
        // The last line starts at: startY + (lines.length - 1) * lineHeight
        // And extends down by fontSize
        const lastLineTop = startY + (lines.length - 1) * lineHeight;
        const textBottom = lastLineTop + textBox.fontSize;
        const actualTextHeight = textBottom - textTop;
        
        // Equal padding on all sides
        const padding = 5;
        
        ctx.strokeStyle = '#0d9488';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
            textBox.x - maxLineWidth / 2 - padding,
            textTop - padding,
            maxLineWidth + (padding * 2),
            actualTextHeight + (padding * 2)
        );
        ctx.setLineDash([]);
    }
    
    ctx.restore();
}

function addTextBox() {
    if (!image) {
        alert('Please upload an image first!');
        return;
    }
    
    const newTextBox = {
        text: 'Your text here',
        x: canvas.width / 2,
        y: canvas.height / 2,
        fontSize: parseInt(fontSizeSlider.value),
        color: textColorPicker.value
    };
    
    textBoxes.push(newTextBox);
    selectedTextBox = textBoxes.length - 1;
    
    // Update UI
    textInput.value = newTextBox.text;
    textControls.style.display = 'flex';
    updateControls();
    
    drawCanvas();
}

function updateTextBoxText() {
    if (selectedTextBox === null) return;
    
    textBoxes[selectedTextBox].text = textInput.value || ' ';
    drawCanvas();
}

function updateTextBoxFontSize() {
    if (selectedTextBox === null) return;
    
    const size = parseInt(fontSizeSlider.value);
    fontSizeValue.textContent = size;
    textBoxes[selectedTextBox].fontSize = size;
    drawCanvas();
}

function updateTextBoxColor() {
    if (selectedTextBox === null) return;
    
    textBoxes[selectedTextBox].color = textColorPicker.value;
    drawCanvas();
}

function deleteSelectedTextBox() {
    if (selectedTextBox === null) return;
    
    textBoxes.splice(selectedTextBox, 1);
    selectedTextBox = null;
    
    if (textBoxes.length === 0) {
        textControls.style.display = 'none';
        textInput.value = '';
    } else {
        selectedTextBox = textBoxes.length - 1;
        updateControls();
    }
    
    drawCanvas();
}

function updateControls() {
    if (selectedTextBox !== null && textBoxes[selectedTextBox]) {
        const textBox = textBoxes[selectedTextBox];
        textInput.value = textBox.text;
        fontSizeSlider.value = textBox.fontSize;
        fontSizeValue.textContent = textBox.fontSize;
        textColorPicker.value = textBox.color || '#ffffff';
    }
}

function getTextBoxAt(x, y) {
    // Check text boxes in reverse order (top to bottom)
    for (let i = textBoxes.length - 1; i >= 0; i--) {
        const textBox = textBoxes[i];
        
        // Temporarily set context to measure text
        ctx.save();
        ctx.font = `${textBox.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const metrics = getTextMetrics(textBox, ctx);
        ctx.restore();
        
        const textWidth = metrics.width;
        const textHeight = metrics.height;
        
        // Check if click is within text bounds
        if (
            x >= textBox.x - textWidth / 2 - 5 &&
            x <= textBox.x + textWidth / 2 + 5 &&
            y >= textBox.y - textHeight / 2 - 5 &&
            y <= textBox.y + textHeight / 2 + 5
        ) {
            return i;
        }
    }
    return null;
}

function handleMouseDown(e) {
    if (!image) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale coordinates to canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    const clickedIndex = getTextBoxAt(canvasX, canvasY);
    
    if (clickedIndex !== null) {
        selectedTextBox = clickedIndex;
        isDragging = true;
        
        const textBox = textBoxes[selectedTextBox];
        dragOffset.x = canvasX - textBox.x;
        dragOffset.y = canvasY - textBox.y;
        
        textControls.style.display = 'flex';
        updateControls();
        drawCanvas();
    } else {
        // If no text box was clicked, create a new one at the click position
        const newTextBox = {
            text: 'Your text here',
            x: canvasX,
            y: canvasY,
            fontSize: parseInt(fontSizeSlider.value),
            color: textColorPicker.value
        };
        
        textBoxes.push(newTextBox);
        selectedTextBox = textBoxes.length - 1;
        
        // Update UI
        textInput.value = newTextBox.text;
        textControls.style.display = 'flex';
        updateControls();
        
        drawCanvas();
    }
}

function handleMouseMove(e) {
    if (!isDragging || selectedTextBox === null) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale coordinates to canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    textBoxes[selectedTextBox].x = canvasX - dragOffset.x;
    textBoxes[selectedTextBox].y = canvasY - dragOffset.y;
    
    // Keep text within canvas bounds
    const textBox = textBoxes[selectedTextBox];
    ctx.save();
    ctx.font = `${textBox.fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const metrics = getTextMetrics(textBox, ctx);
    ctx.restore();
    
    const textWidth = metrics.width;
    const textHeight = metrics.height;
    
    textBox.x = Math.max(textWidth / 2, Math.min(canvas.width - textWidth / 2, textBox.x));
    textBox.y = Math.max(textHeight / 2, Math.min(canvas.height - textHeight / 2, textBox.y));
    
    drawCanvas();
}

function handleMouseUp() {
    isDragging = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    handleMouseDown(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    handleMouseMove(mouseEvent);
}

function handleTouchEnd(e) {
    e.preventDefault();
    handleMouseUp();
}

function downloadMeme() {
    if (!image) return;
    
    // Create a temporary canvas with original image dimensions for better quality
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Use original image dimensions
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    
    // Scale factor
    const scaleX = image.width / canvas.width;
    const scaleY = image.height / canvas.height;
    
    // Draw image
    tempCtx.drawImage(image, 0, 0);
    
    // Draw all text boxes scaled to original size
    textBoxes.forEach(textBox => {
        tempCtx.save();
        const scaledFontSize = textBox.fontSize * scaleX;
        tempCtx.font = `${scaledFontSize}px Arial`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'top';
        
        // Split text by newlines
        const lines = textBox.text.split('\n');
        const lineHeight = scaledFontSize * 1.4;
        const totalHeight = lines.length * lineHeight;
        
        // Calculate starting Y position (centered vertically)
        const scaledY = textBox.y * scaleY;
        const startY = scaledY - totalHeight / 2 + lineHeight / 2;
        
        // Draw each line with stroke and fill
        tempCtx.strokeStyle = 'black';
        tempCtx.lineWidth = 6 * scaleX;
        tempCtx.lineJoin = 'round';
        tempCtx.miterLimit = 2;
        
        tempCtx.fillStyle = textBox.color || '#ffffff';
        
        lines.forEach((line, index) => {
            const y = startY + index * lineHeight;
            tempCtx.strokeText(line, textBox.x * scaleX, y);
            tempCtx.fillText(line, textBox.x * scaleX, y);
        });
        
        tempCtx.restore();
    });
    
    // Download
    tempCanvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meme.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}
