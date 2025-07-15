// Variables para las firmas
const firmas = {
    "ROMINA MENDEZ": "romina-firma.png",
    "DAMIANI GABRIEL": "damiani-firma.png"
};

// Contador para fotos
let photoCount = 1;

// Añadir nueva foto
document.getElementById('add-photo-btn').addEventListener('click', function() {
    photoCount++;
    const newPhoto = document.createElement('div');
    newPhoto.className = 'photo-upload';
    newPhoto.innerHTML = `
        <input type="file" id="photo-upload-${photoCount}" accept="image/*" class="photo-input">
        <img id="photo-preview-${photoCount}" class="photo-preview" style="display: none;">
    `;
    document.getElementById('photo-container').appendChild(newPhoto);

    // Configurar evento para la nueva foto
    document.getElementById(`photo-upload-${photoCount}`).addEventListener('change', function(e) {
        handlePhotoUpload(e, photoCount);
    });
});

// Manejar subida de fotos
function handlePhotoUpload(event, id) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(`photo-preview-${id}`);
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Función para generar un código numérico aleatorio de 7 dígitos
function generateRandomCode() {
    return Math.floor(1000000 + Math.random() * 9000000); // Genera un número entre 1000000 y 9999999
}

// Función para formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Función para aplicar marca de agua
function applyWatermark(doc, inspector) {
    // CONFIGURACIÓN DE PROPIEDADES
    const watermarkConfig = {
        fontSize: 50,              // Tamaño de la fuente (entre 20-120)
        color: [128, 128, 128],         // Color RGB (ej: [255,0,0] para rojo)
        opacity: 0.08,              // Opacidad (0 = transparente, 1 = opaco)
        angle: 45,                 // Ángulo de inclinación (0-360)
        xPosition: 'center' ,       // Posición X ('center', 'left', 'right' o número en mm)
        yPosition: 'center',      // Posición Y ('center', 'top', 'bottom' o número en mm)
        width: 'auto',             // Ancho ('auto' o valor en mm para forzar escalado)
        renderingMode: 'stroke'      // Estilo: 'fill' o 'stroke'
    };

    // APLICAR CONFIGURACIÓN
    doc.setFontSize(watermarkConfig.fontSize);
    doc.setTextColor(
        watermarkConfig.color[0],
        watermarkConfig.color[1],
        watermarkConfig.color[2],
        watermarkConfig.opacity
    );

    // CALCULAR POSICIÓN
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    let xPos;
    if (watermarkConfig.xPosition === 'center') {
        xPos = pageWidth / 2;
    } else if (watermarkConfig.xPosition === 'left') {
        xPos = 20; // Margen izquierdo
    } else if (watermarkConfig.xPosition === 'right') {
        xPos = pageWidth - 20; // Margen derecho
    } else {
        xPos = watermarkConfig.xPosition; // Valor numérico directo
    }

    let yPos;
    if (watermarkConfig.yPosition === 'center') {
        yPos = pageHeight / 2;
    } else if (watermarkConfig.yPosition === 'top') {
        yPos = 20; // Margen superior
    } else if (watermarkConfig.yPosition === 'bottom') {
        yPos = pageHeight - 20; // Margen inferior
    } else {
        yPos = watermarkConfig.yPosition; // Valor numérico directo
    }

    // DIBUJAR MARCA DE AGUA
    doc.text(
        inspector.toUpperCase(),
        xPos,
        yPos,
        {
            align: 'center',
            angle: watermarkConfig.angle,
            renderingMode: watermarkConfig.renderingMode
        }
    );

    // Restablecer color
    doc.setTextColor(0, 0, 0);
}


// Generar y descargar acta como PDF
document.getElementById('generate-btn').addEventListener('click', async function() {
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const inspector = document.getElementById('inspector').value;
    const direccion = document.getElementById('direccion').value;
    const troquel = document.getElementById('troquel').value;

    if (!fecha || !hora || !inspector) {
        alert('Por favor complete todos los campos obligatorios');
        return;
    }

    // Formatear fecha
    const fechaFormateada = formatDate(fecha) + ' ' + hora;

    // Generar HTML del acta
    let actaHTMLContent = `
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
            <div class="header-gcba" style="text-align: center; margin-bottom: 20px;">
                <img src="gcba-logo.png" alt="Gobierno de la Ciudad de Buenos Aires" style="max-width: 300px;">
            </div>

            <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 10px;">ACTA DE CONSTATACION</h1>

            <h2 style="font-size: 18px; text-align: center; margin: 20px 0; text-transform: uppercase;">COMUNA 9</h2>
            <h3 style="font-size: 16px; text-align: center; margin: 15px 0; text-transform: uppercase;">DIRECCION GENERAL DE COMPETENCIAS COMUNALES Y TALLERES</h3>

            <div style="margin-bottom: 30px;">
                <p><strong>FECHA INSPECCIÓN:</strong> ${fechaFormateada}</p>
                <p><strong>LUGAR:</strong> ${direccion}, ${document.getElementById('caba').value}</p>
                <p><strong>ENTRE CALLES:</strong> ${document.getElementById('entre-calles').value}</p>
                <p><strong>RECLAMO:</strong> ${document.getElementById('reclamo').value}</p>
                <p><strong>TROQUEL:</strong> ${troquel}</p>
            </div>

            <h3 style="font-size: 16px; text-align: center; margin: 15px 0; text-transform: uppercase;">VEHÍCULO</h3>

            <div style="margin-bottom: 30px;">
                <p><strong>DOMINIO:</strong> ${document.getElementById('dominio').value}</p>
                <p><strong>TIPO:</strong> ${document.getElementById('tipo').value}</p>
                <p><strong>MARCA:</strong> ${document.getElementById('marca').value} - MODELO: ${document.getElementById('modelo').value}</p>
            </div>

            <div style="margin-bottom: 30px;">
                <p><strong>AUTO ABANDONADO:</strong> ${document.querySelector('input[name="abandonado"]:checked').value}</p>
                <p><strong>HABITADO:</strong> ${document.querySelector('input[name="habitado"]:checked').value}</p>
                <p><strong>TIENE TODAS LOS RUEDAS:</strong> ${document.querySelector('input[name="ruedas"]:checked').value}</p>
                <p><strong>QUEMADO:</strong> ${document.querySelector('input[name="quemado"]:checked').value}</p>
                <p><strong>DESMANTELADO:</strong> ${document.querySelector('input[name="desmantelado"]:checked').value}</p>
                <p><strong>POSEE FALTANTES EN INTERIOR:</strong> ${document.querySelector('input[name="faltantes"]:checked').value}</p>
                <p><strong>ENCADENADO:</strong> ${document.querySelector('input[name="encadenado"]:checked').value}</p>
                <p><strong>VIDRIOS ROTOS:</strong> ${document.querySelector('input[name="vidrios"]:checked').value}</p>
                <p><strong>PINTURA DETERIORADA:</strong> ${document.querySelector('input[name="pintura"]:checked').value}</p>
                <p><strong>PUERTAS ABIERTAS:</strong> ${document.querySelector('input[name="puertas"]:checked').value}</p>
                <p><strong>RUEDAS PINCHADAS/BAJAS:</strong> ${document.querySelector('input[name="ruedas-pinchadas"]:checked').value}</p>
                <p><strong>ACUMULA AGUA O RESIDUOS:</strong> ${document.querySelector('input[name="residuos"]:checked').value}</p>
                <p><strong>MOTOR EXPUESTO:</strong> ${document.querySelector('input[name="motor"]:checked').value}</p>
                <p><strong>FALTANTE DE AUTOPARTES:</strong> ${document.querySelector('input[name="autopartes"]:checked').value}</p>
                <p><strong>DESCRIPCION DEL ESTADO DEL VEHÍCULO:</strong> ${document.getElementById('descripcion').value}</p>
            </div>

            <div style="margin-bottom: 30px;">
                <p><strong>INSPECCIONADO POR:</strong> ${inspector}</p>
            </div>
        </div>
    `;

    // Crear elemento temporal para renderizar HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = actaHTMLContent;
    document.body.appendChild(tempDiv);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 10; // Margen en mm

    // Función para agregar foto y marca de agua
    async function addPhotoWithWatermark(doc, imgData, inspector, isLastPage = false, signatureImg = null) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Capa 1: Procesamiento de la foto
        const img = new Image();
        await new Promise(resolve => {
            img.onload = resolve;
            img.src = imgData;
        });

        // Ajuste de tamaño manteniendo aspecto
        let imgWidth = pageWidth - 2 * margin;
        let imgHeight = (img.naturalHeight / img.naturalWidth) * imgWidth;

        if (imgHeight > pageHeight - 2 * margin - (isLastPage && signatureImg ? 40 : 0)) {
            const scale = (pageHeight - 2 * margin - (isLastPage && signatureImg ? 40 : 0)) / imgHeight;
            imgWidth *= scale;
            imgHeight *= scale;
        }

        const xPos = margin + (pageWidth - 2 * margin - imgWidth) / 2;
        const yPos = margin;

        // Dibuja la foto (capa inferior)
        doc.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);

        // Capa 2: Marca de agua sobre la foto
        applyWatermark(doc, inspector);

        // Capa 3: Firma (si es última página)
        if (isLastPage && signatureImg) {
            const sig = new Image();
            await new Promise(resolve => {
                sig.onload = resolve;
                sig.src = signatureImg;
            });

            const sigWidth = 80;
            const sigHeight = (sig.naturalHeight / sig.naturalWidth) * sigWidth;
            doc.addImage(
                signatureImg, 
                'PNG', 
                (pageWidth - sigWidth) / 2, 
                pageHeight - margin - sigHeight - 10, 
                sigWidth, 
                sigHeight
            );
            doc.setFontSize(10);
            doc.text("FIRMA DEL INSPECTOR", pageWidth / 2, pageHeight - margin - sigHeight - 15, { align: 'center' });
        }
    }

    // Convertir primera página (el acta)
    await html2canvas(tempDiv, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210 - 2 * margin;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        applyWatermark(doc, inspector);
    });

    // Añadir páginas de fotos
    const photoInputs = document.querySelectorAll('.photo-input');
    const signatureImgSrc = firmas[inspector];
    let signatureAdded = false;

    for (let i = 0; i < photoInputs.length; i++) {
        const preview = document.getElementById(`photo-preview-${i + 1}`);

        if (preview && preview.src && preview.style.display !== 'none') {
            doc.addPage();
            await addPhotoWithWatermark(
                doc,
                preview.src,
                inspector,
                i === photoInputs.length - 1,
                signatureImgSrc
            );
        }
    }

    // Eliminar el div temporal
    document.body.removeChild(tempDiv);

    // Construir el nombre del archivo PDF
    const randomCode = generateRandomCode();
    const cleanAddress = direccion.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const pdfFileName = `ACTAS DE CONSTATACION ${cleanAddress} ${troquel} ${randomCode}.pdf`;

    // Descargar el PDF
    doc.save(pdfFileName);
});

// Configurar evento para las fotos existentes
document.querySelectorAll('.photo-input').forEach(input => {
    const id = input.id.split('-')[2];
    input.addEventListener('change', function(e) {
        handlePhotoUpload(e, id);
    });
});

// Botón de impresión
document.getElementById('print-btn').addEventListener('click', function() {
    window.print();
});
