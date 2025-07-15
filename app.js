// Variables para las firmas
const firmas = {
    "ROMINA MENDEZ": "romina-firma.png",
    "DAMIANI GABRIEL": "damiani-firma.png"
};

// Contadores para fotos (uno por cada tipo de acta)
let photoCountConstatacionModelo = 1;
let photoCountVerificacion = 1;
let photoCountSSignos = 1;
let photoCountDeposito = 1;

// Función para manejar la subida de fotos para cualquier contenedor
function handlePhotoUpload(event, id, previewIdPrefix) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(`${previewIdPrefix}${id}`);
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Funciones para añadir nueva foto para cada tipo de acta
document.getElementById('add-photo-btn').addEventListener('click', function() {
    photoCountConstatacionModelo++;
    const newPhoto = document.createElement('div');
    newPhoto.className = 'photo-upload';
    newPhoto.innerHTML = `
        <input type="file" id="photo-upload-${photoCountConstatacionModelo}" accept="image/*" class="photo-input">
        <img id="photo-preview-${photoCountConstatacionModelo}" class="photo-preview" style="display: none;">
    `;
    document.getElementById('photo-container').appendChild(newPhoto);

    document.getElementById(`photo-upload-${photoCountConstatacionModelo}`).addEventListener('change', function(e) {
        handlePhotoUpload(e, photoCountConstatacionModelo, 'photo-preview-');
    });
});

document.getElementById('add-photo-btn-verificacion').addEventListener('click', function() {
    photoCountVerificacion++;
    const newPhoto = document.createElement('div');
    newPhoto.className = 'photo-upload';
    newPhoto.innerHTML = `
        <input type="file" id="photo-upload-verificacion-${photoCountVerificacion}" accept="image/*" class="photo-input-verificacion">
        <img id="photo-preview-verificacion-${photoCountVerificacion}" class="photo-preview" style="display: none;">
    `;
    document.getElementById('photo-container-verificacion').appendChild(newPhoto);

    document.getElementById(`photo-upload-verificacion-${photoCountVerificacion}`).addEventListener('change', function(e) {
        handlePhotoUpload(e, photoCountVerificacion, 'photo-preview-verificacion-');
    });
});

document.getElementById('add-photo-btn-s-signos').addEventListener('click', function() {
    photoCountSSignos++;
    const newPhoto = document.createElement('div');
    newPhoto.className = 'photo-upload';
    newPhoto.innerHTML = `
        <input type="file" id="photo-upload-s-signos-${photoCountSSignos}" accept="image/*" class="photo-input-s-signos">
        <img id="photo-preview-s-signos-${photoCountSSignos}" class="photo-preview" style="display: none;">
    `;
    document.getElementById('photo-container-s-signos').appendChild(newPhoto);

    document.getElementById(`photo-upload-s-signos-${photoCountSSignos}`).addEventListener('change', function(e) {
        handlePhotoUpload(e, photoCountSSignos, 'photo-preview-s-signos-');
    });
});

document.getElementById('add-photo-btn-deposito').addEventListener('click', function() {
    photoCountDeposito++;
    const newPhoto = document.createElement('div');
    newPhoto.className = 'photo-upload';
    newPhoto.innerHTML = `
        <input type="file" id="photo-upload-deposito-${photoCountDeposito}" accept="image/*" class="photo-input-deposito">
        <img id="photo-preview-deposito-${photoCountDeposito}" class="photo-preview" style="display: none;">
    `;
    document.getElementById('photo-container-deposito').appendChild(newPhoto);

    document.getElementById(`photo-upload-deposito-${photoCountDeposito}`).addEventListener('change', function(e) {
        handlePhotoUpload(e, photoCountDeposito, 'photo-preview-deposito-');
    });
});


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
    const watermarkConfig = {
        fontSize: 50,
        color: [128, 128, 128],
        opacity: 0.08,
        angle: 45,
        xPosition: 'center' ,
        yPosition: 'center',
        width: 'auto',
        renderingMode: 'stroke'
    };

    doc.setFontSize(watermarkConfig.fontSize);
    doc.setTextColor(
        watermarkConfig.color[0],
        watermarkConfig.color[1],
        watermarkConfig.color[2],
        watermarkConfig.opacity
    );

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    let xPos;
    if (watermarkConfig.xPosition === 'center') {
        xPos = pageWidth / 2;
    } else if (watermarkConfig.xPosition === 'left') {
        xPos = 20;
    } else if (watermarkConfig.xPosition === 'right') {
        xPos = pageWidth - 20;
    } else {
        xPos = watermarkConfig.xPosition;
    }

    let yPos;
    if (watermarkConfig.yPosition === 'center') {
        yPos = pageHeight / 2;
    } else if (watermarkConfig.yPosition === 'top') {
        yPos = 20;
    } else if (watermarkConfig.yPosition === 'bottom') {
        yPos = pageHeight - 20;
    } else {
        yPos = watermarkConfig.yPosition;
    }

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

    doc.setTextColor(0, 0, 0); // Restablecer color
}

// Función para agregar foto y marca de agua (generalizada)
async function addPhotoWithWatermark(doc, imgData, inspector, isLastPage = false, signatureImg = null) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10; // Margen en mm

    const img = new Image();
    await new Promise(resolve => {
        img.onload = resolve;
        img.src = imgData;
    });

    // Calcular las dimensiones de la imagen para que se ajuste a la página
    let imgWidth = pageWidth - 2 * margin;
    let imgHeight = (img.naturalHeight / img.naturalWidth) * imgWidth;

    // Si la altura calculada es mayor que la altura disponible, reescalar por altura
    const availableHeight = pageHeight - 2 * margin - (isLastPage && signatureImg ? 40 : 0); // Dejar espacio para la firma si es la última página

    if (imgHeight > availableHeight) {
        const scale = availableHeight / imgHeight;
        imgWidth *= scale;
        imgHeight *= scale;
    }

    // Centrar la imagen en la página
    const xPos = margin + (pageWidth - 2 * margin - imgWidth) / 2;
    const yPos = margin + (availableHeight - imgHeight) / 2; // Centrar verticalmente también

    doc.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
    applyWatermark(doc, inspector);

    if (isLastPage && signatureImg) {
        const sig = new Image();
        await new Promise(resolve => {
            sig.onload = resolve;
            sig.src = signatureImg;
        });

        const sigWidth = 80; // Ancho fijo para la firma
        const sigHeight = (sig.naturalHeight / sig.naturalWidth) * sigWidth;
        doc.addImage(
            signatureImg, 
            'PNG', 
            (pageWidth - sigWidth) / 2, 
            pageHeight - margin - sigHeight - 10, // Posición vertical de la firma
            sigWidth, 
            sigHeight
        );
        doc.setFontSize(10);
        doc.text("FIRMA DEL INSPECTOR", pageWidth / 2, pageHeight - margin - sigHeight - 15, { align: 'center' });
    }
}


// --- Lógica para mostrar/ocultar formularios ---
document.addEventListener('DOMContentLoaded', () => {
    const actaTypeSelect = document.getElementById('acta-type-select');
    const forms = {
        'acta-constatacion-modelo': document.getElementById('acta-constatacion-modelo-form'),
        'acta-verificacion': document.getElementById('acta-verificacion-form'),
        'acta-constatacion-s-signos': document.getElementById('acta-constatacion-s-signos-form'),
        'acta-verificacion-deposito': document.getElementById('acta-verificacion-deposito-form')
    };

    actaTypeSelect.addEventListener('change', function() {
        const selectedFormId = this.value;

        // Ocultar todos los formularios
        for (const formId in forms) {
            forms[formId].style.display = 'none';
        }

        // Mostrar el formulario seleccionado
        if (selectedFormId && forms[selectedFormId]) {
            forms[selectedFormId].style.display = 'block';
            document.getElementById('initial-selection').style.display = 'none'; // Ocultar la selección inicial
        } else {
            document.getElementById('initial-selection').style.display = 'block'; // Mostrar la selección inicial si no hay nada seleccionado
        }
    });

    // Configurar eventos para las fotos existentes de cada formulario
    document.querySelectorAll('.photo-input').forEach(input => {
        const id = input.id.split('-')[2];
        input.addEventListener('change', function(e) {
            handlePhotoUpload(e, id, 'photo-preview-');
        });
    });

    document.querySelectorAll('.photo-input-verificacion').forEach(input => {
        const id = input.id.split('-')[3];
        input.addEventListener('change', function(e) {
            handlePhotoUpload(e, id, 'photo-preview-verificacion-');
        });
    });

    document.querySelectorAll('.photo-input-s-signos').forEach(input => {
        const id = input.id.split('-')[3];
        input.addEventListener('change', function(e) {
            handlePhotoUpload(e, id, 'photo-preview-s-signos-');
        });
    });

    document.querySelectorAll('.photo-input-deposito').forEach(input => {
        const id = input.id.split('-')[3];
        input.addEventListener('change', function(e) {
            handlePhotoUpload(e, id, 'photo-preview-deposito-');
        });
    });
});


// --- Generar y descargar acta como PDF (A.A Modelo Constatación - el original) ---
document.getElementById('generate-btn').addEventListener('click', async function() {
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const inspector = document.getElementById('inspector').value;
    const direccion = document.getElementById('direccion').value;
    const entreCalles = document.getElementById('entre-calles').value;
    const reclamo = document.getElementById('reclamo').value;
    const troquel = document.getElementById('troquel').value;
    const dominio = document.getElementById('dominio').value;
    const tipo = document.getElementById('tipo').value;
    const marca = document.getElementById('marca').value;
    const modelo = document.getElementById('modelo').value;
    const abandonado = document.querySelector('input[name="abandonado"]:checked').value;
    const habitado = document.querySelector('input[name="habitado"]:checked').value;
    const ruedas = document.querySelector('input[name="ruedas"]:checked').value;
    const quemado = document.querySelector('input[name="quemado"]:checked').value;
    const desmantelado = document.querySelector('input[name="desmantelado"]:checked').value;
    const faltantes = document.querySelector('input[name="faltantes"]:checked').value;
    const encadenado = document.querySelector('input[name="encadenado"]:checked').value;
    const vidrios = document.querySelector('input[name="vidrios"]:checked').value;
    const pintura = document.querySelector('input[name="pintura"]:checked').value;
    const puertas = document.querySelector('input[name="puertas"]:checked').value;
    const ruedasPinchadas = document.querySelector('input[name="ruedas-pinchadas"]:checked').value;
    const residuos = document.querySelector('input[name="residuos"]:checked').value;
    const motor = document.querySelector('input[name="motor"]:checked').value;
    const autopartes = document.querySelector('input[name="autopartes"]:checked').value;
    const descripcion = document.getElementById('descripcion').value;


    if (!fecha || !hora || !inspector || !direccion || !troquel) {
        alert('Por favor complete todos los campos obligatorios para el Acta de Constatación Modelo.');
        return;
    }

    const fechaFormateada = formatDate(fecha) + ' ' + hora;

    // Crear un div temporal con dimensiones fijas para el renderizado de html2canvas
    const tempRenderDiv = document.createElement('div');
    tempRenderDiv.style.width = '210mm'; // Ancho de A4
    tempRenderDiv.style.minHeight = '297mm'; // Altura mínima de A4
    tempRenderDiv.style.position = 'absolute';
    tempRenderDiv.style.left = '-9999px'; // Moverlo fuera de la vista
    tempRenderDiv.style.backgroundColor = 'white'; // Asegurar fondo blanco
    tempRenderDiv.style.padding = '10mm'; // Márgenes internos para el contenido
    tempRenderDiv.style.boxSizing = 'border-box'; // Incluir padding en el ancho/alto

    tempRenderDiv.innerHTML = `
        <div class="acta-content-printable" style="width: 100%; height: auto;">
            <div class="header-gcba" style="text-align: center; margin-bottom: 15px;">
                <img src="gcba-logo.png" alt="Gobierno de la Ciudad de Buenos Aires" style="max-width: 250px;">
            </div>

            <h1 style="text-align: center; font-size: 20px; margin-bottom: 20px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 8px;">ACTA DE CONSTATACION</h1>

            <h2 style="font-size: 16px; text-align: center; margin: 15px 0; text-transform: uppercase;">COMUNA 9</h2>
            <h3 style="font-size: 14px; text-align: center; margin: 10px 0; text-transform: uppercase;">DIRECCION GENERAL DE COMPETENCIAS COMUNALES Y TALLERES</h3>

            <div style="margin-bottom: 20px;">
                <p style="word-wrap: break-word;"><strong>FECHA INSPECCIÓN:</strong> ${fechaFormateada}</p>
                <p style="word-wrap: break-word;"><strong>LUGAR:</strong> ${direccion}, ${document.getElementById('caba').value}</p>
                <p style="word-wrap: break-word;"><strong>ENTRE CALLES:</strong> ${entreCalles || 'N/A'}</p>
                <p style="word-wrap: break-word;"><strong>RECLAMO:</strong> ${reclamo}</p>
                <p style="word-wrap: break-word;"><strong>TROQUEL:</strong> ${troquel}</p>
            </div>

            <h3 style="font-size: 14px; text-align: center; margin: 10px 0; text-transform: uppercase;">VEHÍCULO</h3>

            <div style="margin-bottom: 20px;">
                <p style="word-wrap: break-word;"><strong>DOMINIO:</strong> ${dominio}</p>
                <p style="word-wrap: break-word;"><strong>TIPO:</strong> ${tipo}</p>
                <p style="word-wrap: break-word;"><strong>MARCA:</strong> ${marca} - MODELO: ${modelo}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <p style="word-wrap: break-word;"><strong>AUTO ABANDONADO:</strong> ${abandonado}</p>
                <p style="word-wrap: break-word;"><strong>HABITADO:</strong> ${habitado}</p>
                <p style="word-wrap: break-word;"><strong>TIENE TODAS LOS RUEDAS:</strong> ${ruedas}</p>
                <p style="word-wrap: break-word;"><strong>QUEMADO:</strong> ${quemado}</p>
                <p style="word-wrap: break-word;"><strong>DESMANTELADO:</strong> ${desmantelado}</p>
                <p style="word-wrap: break-word;"><strong>POSEE FALTANTES EN INTERIOR:</strong> ${faltantes}</p>
                <p style="word-wrap: break-word;"><strong>ENCADENADO:</strong> ${encadenado}</p>
                <p style="word-wrap: break-word;"><strong>VIDRIOS ROTOS:</strong> ${vidrios}</p>
                <p style="word-wrap: break-word;"><strong>PINTURA DETERIORADA:</strong> ${pintura}</p>
                <p style="word-wrap: break-word;"><strong>PUERTAS ABIERTAS:</strong> ${puertas}</p>
                <p style="word-wrap: break-word;"><strong>RUEDAS PINCHADAS/BAJAS:</strong> ${ruedasPinchadas}</p>
                <p style="word-wrap: break-word;"><strong>ACUMULA AGUA O RESIDUOS:</strong> ${residuos}</p>
                <p style="word-wrap: break-word;"><strong>MOTOR EXPUESTO:</strong> ${motor}</p>
                <p style="word-wrap: break-word;"><strong>FALTANTE DE AUTOPARTES:</strong> ${autopartes}</p>
                <p style="word-wrap: break-word;"><strong>DESCRIPCION DEL ESTADO DEL VEHÍCULO:</strong> ${descripcion || 'Sin descripción.'}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <p style="word-wrap: break-word;"><strong>INSPECCIONADO POR:</strong> ${inspector}</p>
            </div>
        </div>
    `;
    document.body.appendChild(tempRenderDiv); // Añadir al DOM para que html2canvas pueda capturarlo

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 10;

    await html2canvas(tempRenderDiv.querySelector('.acta-content-printable'), { 
        scale: 3, // Aumentar la escala para mejor calidad y mantener proporción
        useCORS: true,
        windowWidth: 794, // Ancho de A4 en píxeles a 96 DPI (210mm * 96dpi / 25.4mm/inch)
        windowHeight: tempRenderDiv.scrollHeight // Capturar toda la altura del contenido
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210 - 2 * margin; // Ancho de la página A4 menos los márgenes
        let imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        doc.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
        applyWatermark(doc, inspector);
        heightLeft -= (doc.internal.pageSize.getHeight() - 2 * margin);

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
            applyWatermark(doc, inspector);
            heightLeft -= (doc.internal.pageSize.getHeight() - 2 * margin);
        }
    });

    document.body.removeChild(tempRenderDiv); // Eliminar el div temporal después de la captura

    const photoInputs = document.querySelectorAll('.photo-input');
    const signatureImgSrc = firmas[inspector];

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

    const randomCode = generateRandomCode();
    const cleanAddress = direccion.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const pdfFileName = `ACTAS DE CONSTATACION ${cleanAddress} ${troquel} ${randomCode}.pdf`;

    doc.save(pdfFileName);
});

// --- Generar y descargar acta como PDF (A.A Acta de Verificacion) ---
document.getElementById('generate-btn-verificacion').addEventListener('click', async function() {
    const fecha = document.getElementById('fecha-verificacion').value;
    const hora = document.getElementById('hora-verificacion').value;
    const inspector = document.getElementById('inspector-verificacion').value;
    const direccion = document.getElementById('direccion-verificacion').value;
    const entreCalles = document.getElementById('entre-calles-verificacion').value;
    const reclamo = document.getElementById('reclamo-verificacion').value;
    const troquel = document.getElementById('troquel-verificacion').value;
    const dominio = document.getElementById('dominio-verificacion').value;
    const marcaModelo = document.getElementById('marca-modelo-verificacion').value;
    const color = document.getElementById('color-verificacion').value;
    const permanencia = document.querySelector('input[name="permanencia-verificacion"]:checked').value;
    const observaciones = document.getElementById('observaciones-verificacion').value;

    if (!fecha || !hora || !inspector || !direccion || !reclamo || !troquel || !dominio || !marcaModelo || !color) {
        alert('Por favor complete todos los campos obligatorios para el Acta de Verificación.');
        return;
    }

    const fechaFormateada = formatDate(fecha) + ' ' + hora;

    // Crear un div temporal con dimensiones fijas para el renderizado de html2canvas
    const tempRenderDiv = document.createElement('div');
    tempRenderDiv.style.width = '210mm'; // Ancho de A4
    tempRenderDiv.style.minHeight = '297mm'; // Altura mínima de A4
    tempRenderDiv.style.position = 'absolute';
    tempRenderDiv.style.left = '-9999px'; // Moverlo fuera de la vista
    tempRenderDiv.style.backgroundColor = 'white'; // Asegurar fondo blanco
    tempRenderDiv.style.padding = '10mm'; // Márgenes internos para el contenido
    tempRenderDiv.style.boxSizing = 'border-box'; // Incluir padding en el ancho/alto

    tempRenderDiv.innerHTML = `
        <div class="acta-content-printable" style="width: 100%; height: auto;">
            <div class="header-gcba" style="text-align: center; margin-bottom: 20px;">
                <img src="gcba-logo.png" alt="Gobierno de la Ciudad de Buenos Aires" style="max-width: 300px;">
            </div>

            <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 10px;">ACTA DE VERIFICACIÓN</h1>

            <h2 style="font-size: 18px; text-align: center; margin: 20px 0; text-transform: uppercase;">COMUNA 9</h2>
            <h3 style="font-size: 16px; text-align: center; margin: 15px 0; text-transform: uppercase;">DIRECCION GENERAL DE COMPETENCIAS COMUNALES Y TALLERES</h3>

            <div style="margin-bottom: 30px;">
                <p><strong>FECHA INSPECCIÓN:</strong> ${fechaFormateada}</p>
                <p><strong>DIRECCIÓN:</strong> ${direccion}, ${document.getElementById('caba-verificacion').value}</p>
                <p><strong>ENTRE CALLES:</strong> ${entreCalles || 'N/A'}</p>
                <p><strong>RECLAMO:</strong> ${reclamo}</p>
                <p><strong>TROQUEL:</strong> ${troquel}</p>
            </div>

            <h3 style="font-size: 16px; text-align: center; margin: 15px 0; text-transform: uppercase;">VEHÍCULO</h3>

            <div style="margin-bottom: 30px;">
                <p><strong>DOMINIO:</strong> ${dominio}</p>
                <p><strong>MARCA/MODELO:</strong> ${marcaModelo}</p>
                <p><strong>COLOR:</strong> ${color}</p>
                <p><strong>PERMANENCIA DEL VEHÍCULO EN EL LUGAR:</strong> ${permanencia}</p>
            </div>

            <div style="margin-bottom: 30px;">
                <p><strong>OBSERVACIONES:</strong> ${observaciones || 'Sin observaciones.'}</p>
            </div>

            <div style="margin-bottom: 30px;">
                <p><strong>INSPECCIONADO POR:</strong> ${inspector}</p>
            </div>
        </div>
    `;
    document.body.appendChild(tempRenderDiv);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 10;

    await html2canvas(tempRenderDiv.querySelector('.acta-content-printable'), { 
        scale: 3,
        useCORS: true,
        windowWidth: 794,
        windowHeight: tempRenderDiv.scrollHeight
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210 - 2 * margin;
        let imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        doc.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
        applyWatermark(doc, inspector);
        heightLeft -= (doc.internal.pageSize.getHeight() - 2 * margin);

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
            applyWatermark(doc, inspector);
            heightLeft -= (doc.internal.pageSize.getHeight() - 2 * margin);
        }
    });

    document.body.removeChild(tempRenderDiv);

    const photoInputs = document.querySelectorAll('.photo-input-verificacion');
    const signatureImgSrc = firmas[inspector];

    for (let i = 0; i < photoInputs.length; i++) {
        const preview = document.getElementById(`photo-preview-verificacion-${i + 1}`);

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

    const randomCode = generateRandomCode();
    const cleanAddress = direccion.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const pdfFileName = `ACTA DE VERIFICACION ${cleanAddress} ${troquel} ${randomCode}.pdf`;

    doc.save(pdfFileName);
});

// --- Generar y descargar acta como PDF (A.D Acta de constatacion s-signos) ---
document.getElementById('generate-btn-s-signos').addEventListener('click', async function() {
    const fecha = document.getElementById('fecha-s-signos').value;
    const hora = document.getElementById('hora-s-signos').value;
    const inspector = document.getElementById('inspector-s-signos').value;
    
    const direccion = document.getElementById('direccion-s-signos').value;
    const entreCalles = document.getElementById('entre-calles-s-signos').value;
    const reclamo = document.getElementById('reclamo-s-signos').value;
    const troquel = document.getElementById('troquel-s-signos').value;
    const tipoVehiculo = document.getElementById('tipo-vehiculo-s-signos').value;
    const enDeposito = document.querySelector('input[name="en-deposito-s-signos"]:checked').value;
    const dominio = document.getElementById('dominio-s-signos').value; // Puede estar vacío
    const multa = document.querySelector('input[name="multa-s-signos"]:checked').value;

    if (!fecha || !hora || !inspector  || !direccion || !reclamo || !troquel || !tipoVehiculo) {
        alert('Por favor complete todos los campos obligatorios para el Acta de Constatación s/signos.');
        return;
    }

    const fechaFormateada = formatDate(fecha) + ' ' + hora;

    // Crear un div temporal con dimensiones fijas para el renderizado de html2canvas
    const tempRenderDiv = document.createElement('div');
    tempRenderDiv.style.width = '210mm'; // Ancho de A4
    tempRenderDiv.style.minHeight = '297mm'; // Altura mínima de A4
    tempRenderDiv.style.position = 'absolute';
    tempRenderDiv.style.left = '-9999px'; // Moverlo fuera de la vista
    tempRenderDiv.style.backgroundColor = 'white'; // Asegurar fondo blanco
    tempRenderDiv.style.padding = '10mm'; // Márgenes internos para el contenido
    tempRenderDiv.style.boxSizing = 'border-box'; // Incluir padding en el ancho/alto

    tempRenderDiv.innerHTML = `
        <div class="acta-content-printable" style="width: 100%; height: auto;">
            <div class="header-gcba" style="text-align: center; margin-bottom: 20px;">
                <img src="gcba-logo.png" alt="Gobierno de la Ciudad de Buenos Aires" style="max-width: 300px;">
            </div>

            <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 10px;">ACTA DE CONSTATACIÓN (S/SIGNOS-INEX)</h1>

            <h2 style="font-size: 18px; text-align: center; margin: 20px 0; text-transform: uppercase;">COMUNA 9</h2>
            <h3 style="font-size: 16px; text-align: center; margin: 15px 0; text-transform: uppercase;">DIRECCION GENERAL DE COMPETENCIAS COMUNALES Y TALLERES</h3>

            <div style="margin-bottom: 30px;">
                <p><strong>FECHA INSPECCIÓN:</strong> ${fechaFormateada}</p>
                <p><strong>LUGAR:</strong> - Dirección: ${direccion} ${entreCalles ? 'entre ' + entreCalles : ''}, ${document.getElementById('caba-s-signos').value}</p>
                <p><strong>RECLAMO:</strong> ${reclamo}</p>
                <p><strong>TROQUEL:</strong> ${troquel}</p>
            </div>

            <h3 style="font-size: 16px; text-align: center; margin: 15px 0; text-transform: uppercase;">VEHÍCULO</h3>

            <div style="margin-bottom: 30px;">
                <p><strong>VEHÍCULO:</strong> ${tipoVehiculo}</p>
                <p><strong>EN DEPÓSITO (MÁS DE 48HS EN EL LUGAR):</strong> ${enDeposito}</p>
                <p><strong>DOMINIO:</strong> ${dominio || 'N/A'}</p>
                <p><strong>MULTA DEPÓSITO/MAL ESTACIONADO:</strong> ${multa}</p>
            </div>

            <div style="margin-bottom: 30px;">
                <p><strong>INSPECCIONADO POR:</strong> ${inspector}</p>
            </div>
        </div>
    `;
    document.body.appendChild(tempRenderDiv);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 10;

    await html2canvas(tempRenderDiv.querySelector('.acta-content-printable'), { 
        scale: 3,
        useCORS: true,
        windowWidth: 794,
        windowHeight: tempRenderDiv.scrollHeight
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210 - 2 * margin;
        let imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        doc.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
        applyWatermark(doc, inspector);
        heightLeft -= (doc.internal.pageSize.getHeight() - 2 * margin);

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
            applyWatermark(doc, inspector);
            heightLeft -= (doc.internal.pageSize.getHeight() - 2 * margin);
        }
    });

    document.body.removeChild(tempRenderDiv);

    const photoInputs = document.querySelectorAll('.photo-input-s-signos');
    const signatureImgSrc = firmas[inspector];

    for (let i = 0; i < photoInputs.length; i++) {
        const preview = document.getElementById(`photo-preview-s-signos-${i + 1}`);

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

    const randomCode = generateRandomCode();
    const cleanAddress = direccion.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const pdfFileName = `ACTA DE CONSTATACION S-SIGNOS ${cleanAddress} ${troquel} ${randomCode}.pdf`;

    doc.save(pdfFileName);
});

// --- Generar y descargar acta como PDF (A.D Acta de verificacion en deposito) ---
document.getElementById('generate-btn-deposito').addEventListener('click', async function() {
    const fecha = document.getElementById('fecha-deposito').value;
    const hora = document.getElementById('hora-deposito').value;
    const inspector = document.getElementById('inspector-deposito').value;
    const direccion = document.getElementById('direccion-deposito').value;
    const entreCalles = document.getElementById('entre-calles-deposito').value;
    const reclamo = document.getElementById('reclamo-deposito').value;
    const troquel = document.getElementById('troquel-deposito').value;
    const dominio = document.getElementById('dominio-deposito').value;
    const marcaModelo = document.getElementById('marca-modelo-deposito').value;
    const color = document.getElementById('color-deposito').value;
    const permanencia = document.querySelector('input[name="permanencia-deposito"]:checked').value;
    const multa = document.querySelector('input[name="multa-deposito"]:checked').value;
    const observaciones = document.getElementById('observaciones-deposito').value;

    if (!fecha || !hora || !inspector || !direccion || !reclamo || !troquel || !dominio || !marcaModelo || !color) {
        alert('Por favor complete todos los campos obligatorios para el Acta de Verificación en Depósito.');
        return;
    }

    const fechaFormateada = formatDate(fecha) + ' ' + hora;

    // Crear un div temporal con dimensiones fijas para el renderizado de html2canvas
    const tempRenderDiv = document.createElement('div');
    tempRenderDiv.style.width = '210mm'; // Ancho de A4
    tempRenderDiv.style.minHeight = '297mm'; // Altura mínima de A4
    tempRenderDiv.style.position = 'absolute';
    tempRenderDiv.style.left = '-9999px'; // Moverlo fuera de la vista
    tempRenderDiv.style.backgroundColor = 'white'; // Asegurar fondo blanco
    tempRenderDiv.style.padding = '10mm'; // Márgenes internos para el contenido
    tempRenderDiv.style.boxSizing = 'border-box'; // Incluir padding en el ancho/alto

    tempRenderDiv.innerHTML = `
        <div class="acta-content-printable" style="width: 100%; height: auto;">
            <div class="header-gcba" style="text-align: center; margin-bottom: 20px;">
                <img src="gcba-logo.png" alt="Gobierno de la Ciudad de Buenos Aires" style="max-width: 300px;">
            </div>

            <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 10px;">ACTA DE VERIFICACIÓN EN DEPÓSITO</h1>

            <h2 style="font-size: 18px; text-align: center; margin: 20px 0; text-transform: uppercase;">COMUNA 9</h2>
            <h3 style="font-size: 16px; text-align: center; margin: 15px 0; text-transform: uppercase;">DIRECCION GENERAL DE COMPETENCIAS COMUNALES Y TALLERES</h3>

            <div style="margin-bottom: 30px;">
                <p><strong>FECHA INSPECCIÓN:</strong> ${fechaFormateada}</p>
                <p><strong>DIRECCIÓN:</strong> ${direccion}, ${document.getElementById('caba-deposito').value}</p>
                <p><strong>ENTRE CALLES:</strong> ${entreCalles || 'N/A'}</p>
                <p><strong>RECLAMO:</strong> ${reclamo}</p>
                <p><strong>TROQUEL:</strong> ${troquel}</p>
            </div>

            <h3 style="font-size: 16px; text-align: center; margin: 15px 0; text-transform: uppercase;">VEHÍCULO</h3>

            <div style="margin-bottom: 30px;">
                <p><strong>DOMINIO:</strong> ${dominio}</p>
                <p><strong>MARCA/MODELO:</strong> ${marcaModelo}</p>
                <p><strong>COLOR:</strong> ${color}</p>
                <p><strong>PERMANENCIA DEL VEHÍCULO EN EL LUGAR:</strong> ${permanencia}</p>
                <p><strong>MULTA DEPÓSITO/MAL ESTACIONADO:</strong> ${multa}</p>
            </div>

            <div style="margin-bottom: 30px;">
                <p><strong>OBSERVACIONES:</strong> ${observaciones || 'Sin observaciones.'}</p>
            </div>

            <div style="margin-bottom: 30px;">
                <p><strong>INSPECCIONADO POR:</strong> ${inspector}</p>
            </div>
        </div>
    `;
    document.body.appendChild(tempRenderDiv);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 10;

    await html2canvas(tempRenderDiv.querySelector('.acta-content-printable'), { 
        scale: 3,
        useCORS: true,
        windowWidth: 794,
        windowHeight: tempRenderDiv.scrollHeight
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210 - 2 * margin;
        let imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        doc.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
        applyWatermark(doc, inspector);
        heightLeft -= (doc.internal.pageSize.getHeight() - 2 * margin);

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
            applyWatermark(doc, inspector);
            heightLeft -= (doc.internal.pageSize.getHeight() - 2 * margin);
        }
    });

    document.body.removeChild(tempRenderDiv);

    const photoInputs = document.querySelectorAll('.photo-input-deposito');
    const signatureImgSrc = firmas[inspector];

    for (let i = 0; i < photoInputs.length; i++) {
        const preview = document.getElementById(`photo-preview-deposito-${i + 1}`);

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

    const randomCode = generateRandomCode();
    const cleanDominio = dominio.replace(/[^a-zA-Z0-9]/g, '').trim();
    const pdfFileName = `ACTA DE VERIFICACION EN DEPOSITO ${cleanDominio} ${troquel} ${randomCode}.pdf`;

    doc.save(pdfFileName);
});
