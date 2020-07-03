let DB;

//selectores de la interfaz
const form = document.querySelector('form'),
    nombreMascota = document.querySelector('#mascota'),
    nombreCLiente = document.querySelector('#cliente'),
    telefono = document.querySelector('#telefono'),
    fecha = document.querySelector('#fecha'),
    hora = document.querySelector('#hora'),
    sintomas = document.querySelector('#sintomas'),
    citas = document.querySelector('#citas'),
    headingAdministra = document.querySelector('#administra');

//Esperar por el DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    //crear la base de datos con .open se crea la BD
    let creadDB = window.indexedDB.open('citas', 1);
    //si hay un error enviarlo a la consola
    creadDB.onerror = function() {
            console.log('Hubo un error');
        }
        // si todo esta bien mostrar en consola y asignar la BD
    creadDB.onsuccess = function() {
            //console.log('Todo listo');
            ///asignar a la BD
            DB = creadDB.result;
            //console.log(DB);
            mostrarCitas();
        }
        //metodo solo corre una vez y es ideal para crear el Schema de la base de datos
        // por eso es ideal para agregar todos lso campos de mi DB
    creadDB.onupgradeneeded = function(e) {
            // el evento que corre es la misma bd
            let db = e.target.result;
            console.log(db);
            //definir el objectStore toma dos parametros nombre DB y segundo las opciones
            //keyPath nos dice cual es la llave primaria
            let objetStore = db.createObjectStore('citas', { keyPath: 'key', autoIncrement: true });
            //crear lso indices y campos de la db createIndex : 3 parametros, nombre, keyPath y opciones
            objetStore.createIndex('mascota', 'mascota', { unique: false });
            objetStore.createIndex('cliente', 'cliente', { unique: false });
            objetStore.createIndex('telefono', 'telefono', { unique: false });
            objetStore.createIndex('fecha', 'fecha', { unique: false });
            objetStore.createIndex('hora', 'hora', { unique: false });
            objetStore.createIndex('sintomas', 'sintomas', { unique: false });

            console.log('DB creada y lista');

        }
        //cuando el formulario se envia
    form.addEventListener('submit', agregarDatos);


    function agregarDatos(e) {
        e.preventDefault();
        const nuevaCita = {
                mascota: nombreMascota.value,
                cliente: nombreCLiente.value,
                telefono: telefono.value,
                fecha: fecha.value,
                hora: hora.value,
                sintomas: sintomas.value
            }
            //console.log(nuevaCita);
            //en indedxdb se utilizan las transacciones
        let transaction = DB.transaction(['citas'], 'readwrite');
        let objectStore = transaction.objectStore('citas');

        let peticion = objectStore.add(nuevaCita);
        console.log(peticion);

        peticion.onsuccess = () => {
            form.reset();
        }
        transaction.oncomplete = () => {
            console.log('cita Agregada');
            mostrarCitas();
        }
        peticion.onerror = () => {
            console.log('valio pistola :C');
        }

    }

    function mostrarCitas() {
        //limpiar las citas anteriores
        while (citas.firstChild) {
            citas.removeChild(citas.firstChild);
        }
        //crear un object store, siempre se va arequerir un object store
        // para ocupar la db
        let objectStore = DB.transaction('citas').objectStore('citas');
        //esto retorna una peticion
        // el evento que se pasa el la bd o el cursor openCursor recore los registros
        objectStore.openCursor().onsuccess = function(e) {
            //cursor se va a hubicar en el registro indicado para acceder
            //a los datos adecuados
            let cursor = e.target.result;
            //console.log(cursor);
            if (cursor) {
                let citaHTML = document.createElement('li');
                citaHTML.setAttribute('data-cita-id', cursor.value.key);
                citaHTML.classList.add('list-group-item');
                citaHTML.innerHTML = `
                <p class ="font-weight-bold">Mascota: <span class"font-weight-normal">${cursor.value.mascota}</span></p>
                <p class ="font-weight-bold">Cliente: <span class"font-weight-normal">${cursor.value.cliente}</span></p>
                <p class ="font-weight-bold">Telefono: <span class"font-weight-normal">${cursor.value.telefono}</span></p>
                <p class ="font-weight-bold">Fecha: <span class"font-weight-normal">${cursor.value.fecha}</span></p>
                <p class ="font-weight-bold">Hora: <span class"font-weight-normal">${cursor.value.hora}</span></p>
                <p class ="font-weight-bold">Sintomas: <span class"font-weight-normal">${cursor.value.sintomas}</span></p>
                `;

                //crear el boton de borrar
                const botonBorrar = document.createElement('button');
                botonBorrar.classList.add('borrar', 'btn', 'btn-danger');
                botonBorrar.innerHTML = `<span aria-hidden="true">x</span> Borrar`;
                botonBorrar.onclick = borrarCita;
                citaHTML.appendChild(botonBorrar);

                //append en el padre
                citas.appendChild(citaHTML);
                //consultar los proximos registros
                cursor.continue();
            } else {
                if (!citas.firstChild) {
                    //cuando no hay registros
                    headingAdministra.textContent = 'Agrega citas para comenzar';
                    let listado = createElement('p');
                    listado.classList.add('text-center');
                    listado.textContent = 'No hay registros';
                    citas.appendChild(listado)
                } else {
                    headingAdministra.textContent = 'Administra tus citas';
                }

            }
        }
    }

    function borrarCita(e) {
        let citaID = Number(e.target.parentElement.getAttribute('data-cita-id'));
        let transaction = DB.transaction(['citas'], 'readwrite');
        let objectStore = transaction.objectStore('citas');

        let peticion = objectStore.delete(citaID);
        transaction.oncomplete = () => {
            e.target.parentElement.parentElement.removeChild(e.target.parentElement);
            console.log(`Se elimino la cita con el id ${citaID}`);
            if (!citas.firstChild) {
                //cuando no hay registros
                headingAdministra.textContent = 'Agrega citas para comenzar';
                let listado = createElement('p');
                listado.classList.add('text-center');
                listado.textContent = 'No hay registros';
                citas.appendChild(listado)
            } else {
                headingAdministra.textContent = 'Administra tus citas';
            }
        }
    }
})