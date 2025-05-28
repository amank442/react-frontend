import internalerrorimage from '../assets/Internal-Server-Error.png';

const Internalerror = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${internalerrorimage})`, // Set the background image
        height: '100vh', 
        width: '100vw', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
      }}
    >
      
    </div>
  );
};

export default Internalerror;
