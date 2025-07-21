
document.addEventListener('DOMContentLoaded', () => {

    
    const entradaCiudad = document.getElementById('entrada-ciudad');
    const botonBuscar = document.getElementById('boton-buscar');
    const spinnerCargando = document.getElementById('cargando');
    const mensajeError = document.getElementById('mensaje-error');
    const areaClima = document.getElementById('area-clima');

    // Elementos el clima actual
    const nombreUbicacion = document.getElementById('nombre-ubicacion');
    const iconoClima = document.getElementById('icono-clima');
    const temperatura = document.getElementById('temperatura');
    const descripcionClima = document.getElementById('descripcion-clima');
    const humedad = document.getElementById('humedad');
    const velocidadViento = document.getElementById('velocidad-viento');

    // Contenedor para las tarjetas del pronóstico
    const tarjetasPronostico = document.getElementById('tarjetas-pronostico');

    
    const API_KEY = 'c2bd3aa951f54cd1eb42dfc7d1014bef'; 

    const URL_CLIMA_ACTUAL = 'https://api.openweathermap.org/data/2.5/weather';
    const URL_PRONOSTICO = 'https://api.openweathermap.org/data/2.5/forecast';

    
    function mostrar(elemento) {
        elemento.classList.remove('oculto');
    }

    function ocultar(elemento) {
        elemento.classList.add('oculto');
    }

    function mostrarCargando() {
        ocultar(areaClima);       // Oculta la sección de clima
        ocultar(mensajeError);    // Oculta cualquier mensaje de error
        mostrar(spinnerCargando); // Muestra el spinner
    }

    function ocultarCargando() {
        ocultar(spinnerCargando); // Oculta el spinner
    }

    function mostrarMensajeError(mensaje) {
        ocultar(areaClima);       // Oculta la sección de clima
        ocultarCargando();        // Oculta el spinner
        mensajeError.innerText = mensaje; // Establece el texto del error
        mostrar(mensajeError);    // Muestra el mensaje de error
    }

    function ocultarMensajeError() {
        ocultar(mensajeError);    // Oculta el mensaje de error
    }

    
    function obtenerClaseIconoClima(codigoIcono) {
        switch (codigoIcono) {
            case '01d': return 'fa-sun'; //  (día)
            case '01n': return 'fa-moon'; // (noche)
            case '02d': return 'fa-cloud-sun'; // Nubes dispersas (día)
            case '02n': return 'fa-cloud-moon'; // Nubes dispersas (noche)
            case '03d':
            case '03n': return 'fa-cloud'; // Nubes
            case '04d':
            case '04n': return 'fa-cloud-meatball'; // Nubes rotas
            case '09d':
            case '09n': return 'fa-cloud-showers-heavy'; // Lluvia fuerte
            case '10d':
            case '10n': return 'fa-cloud-sun-rain'; // Lluvia (día/noche)
            case '11d':
            case '11n': return 'fa-bolt'; // Tormenta
            case '13d':
            case '13n': return 'fa-snowflake'; // Nieve
            case '50d':
            case '50n': return 'fa-smog'; // Niebla/Bruma
            default: return 'fa-question-circle'; // Icono por defecto si no se reconoce
        }
    }

    // Función principal para obtener los datos del clima
    async function obtenerDatosClima(ciudad) {
        // Validación de la clave API
        if (!API_KEY || API_KEY === 'TU_CLAVE_API_AQUI') {
            mostrarMensajeError('¡ERROR! Por favor, obtén tu clave API de OpenWeatherMap y reemplaza "TU_CLAVE_API_AQUI" en script.js.');
            return;
        }

        // Validación de que se haya introducido la ciudad
        if (ciudad.trim() === '') {
            mostrarMensajeError('Por favor, introduce el nombre de una ciudad.');
            return;
        }

        mostrarCargando(); // Muestra el spinner mientras se obtienen los datos

        try {
            // Realizar petición para el clima actual
            const respuestaClimaActual = await fetch(
                `${URL_CLIMA_ACTUAL}?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`
            );
            const datosClimaActual = await respuestaClimaActual.json();

            // Realizar petición para el pronóstico
            const respuestaPronostico = await fetch(
                `${URL_PRONOSTICO}?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`
            );
            const datosPronostico = await respuestaPronostico.json();

            // Verificar si hubo errores en las respuestas de la API
            if (datosClimaActual.cod !== 200 || datosPronostico.cod !== '200') {
                // Si la ciudad no existe o hay otro error de la API
                const mensajeApi = datosClimaActual.message || datosPronostico.message || 'Ciudad no encontrada o error desconocido de la API.';
                mostrarMensajeError(`Error: ${mensajeApi.charAt(0).toUpperCase() + mensajeApi.slice(1)}`); // Capitaliza el mensaje
                return;
            }

            // Si todo fue bien, oculta el mensaje de error y muestra los datos
            ocultarMensajeError();
            mostrarClimaActual(datosClimaActual);
            mostrarPronostico(datosPronostico);
            mostrar(areaClima); // Muestra toda la sección de resultados
        } catch (error) {
           
            console.error('Error al obtener datos del clima:', error);
            mostrarMensajeError('No se pudo conectar con el servicio del clima. Revisa tu conexión o intenta de nuevo más tarde.');
        } finally {
            
            ocultarCargando(); // Oculta el spinner
        }
    }

    
    function mostrarClimaActual(data) {
        nombreUbicacion.innerText = `${data.name}, ${data.sys.country}`;
        temperatura.innerText = `${Math.round(data.main.temp)}°C`;
        descripcionClima.innerText = data.weather[0].description;
        humedad.innerText = `${data.main.humidity}%`;
        // Convertir velocidad del viento de m/s a km/h y redondear
        velocidadViento.innerText = `${Math.round(data.wind.speed * 3.6)} km/h`; 

        // Actualizar el icono de Font Awesome
        iconoClima.className = `fas ${obtenerClaseIconoClima(data.weather[0].icon)}`;
    }

    // Función mostrar el pronóstico de los próximos días
    function mostrarPronostico(data) {
        tarjetasPronostico.innerHTML = ''; // Limpiar pronósticos anteriores

        const pronosticoDiario = {}; 

        
        data.list.forEach(item => {
            const fecha = new Date(item.dt * 1000); // Convertir timestamp (segundos) a milisegundos
            const diaKey = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

           
            if (!pronosticoDiario[diaKey]) {
                pronosticoDiario[diaKey] = item;
            }
        });

        // Convertir el objeto a un array y tomar solo los primeros 5 días (excluyendo el actual)
        const diasMostrar = Object.values(pronosticoDiario).slice(0, 5); 

        diasMostrar.forEach(item => {
            const fecha = new Date(item.dt * 1000);
            const nombreDia = fecha.toLocaleDateString('es-ES', { weekday: 'short' }); 
            const temp = Math.round(item.main.temp);
            const desc = item.weather[0].description;
            const codigoIcono = item.weather[0].icon;

            // Crear el elemento de la tarjeta de pronóstico
            const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta-pronostico'; 

           
            tarjeta.innerHTML = `
                <p class="dia">${nombreDia}</p>
                <i class="fas icono-pequeno ${obtenerClaseIconoClima(codigoIcono)}"></i>
                <p class="temperatura-pequena">${temp}°C</p>
                <p class="descripcion-pequena">${desc}</p>
            `;
            tarjetasPronostico.appendChild(tarjeta); // Añadir la tarjeta al contenedor
        });
    }


    // Cuando se hace clic en el botón "Buscar"
    botonBuscar.addEventListener('click', () => {
        const ciudad = entradaCiudad.value; // Obtiene el valor del input
        obtenerDatosClima(ciudad); // Llama a la función para obtener el clima
    });

    // Cuando se presiona una tecla en el campo de texto (para buscar con Enter)
    entradaCiudad.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { // Si la tecla presionada es "Enter"
            const ciudad = entradaCiudad.value;
            obtenerDatosClima(ciudad);
        }
    });

    
    // Carga el clima de una ciudad por defecto cuando la página se carga por primera vez
    obtenerDatosClima('Medellin'); // Puedes cambiar "Medellin" por tu ciudad favorita
});