import './AboutAuthor.css';
import authorImg from '../../assets/author.jpg'; // si no tienes esta imagen, cambiamos la ruta o quitamos la img

function AboutAuthor() {
  return (
    <section className="author" aria-labelledby="author-title">
      <div className="author__image-wrapper">
        {/* Si aún no tienes imagen, puedes comentar <img /> y dejar solo el círculo vacío */}
        <div className="author__image-circle">
          {authorImg && (
            <img src={authorImg} alt="Foto del autor del proyecto" className="author__image" />
          )}
        </div>
      </div>

      <div className="author__content">
        <h2 id="author-title" className="author__title">
          Acerca del autor
        </h2>
        <p className="author__text">
          Hola, soy Carlos Dur O, MBA en Administración de Empresas y MPA, Desarrollador Full Stack
          (React, Node.js, Python) y Científico de Datos, Ingeniero en Arquitectura y Software
          Especialista en Éxito del Cliente y Cambio Organizacional
        </p>
        <p className="author__text">
          Lo aprendido durante la Certificación fue: Diseñar y liderar soluciones de entrega
          tecnológicas, alineando los objetivos de negocio con las prácticas ágiles, CI/CD y DevOps.
          Desarrollar aplicaciones web integrales con React como front-end, Node.js como back-end y
          pipelines de datos basados ​​en Python. Transformar datos en información práctica mediante
          modelado, visualización y análisis predictivo. Impulsar la adopción y el éxito de los
          usuarios, facilitando la comunicación entre producto, ingeniería y las partes interesadas.
        </p>
      </div>
    </section>
  );
}

export default AboutAuthor;
