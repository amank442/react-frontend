import notfound from '../assets/404_page-not-found.png'

const Notfound = () => {
  return (
     <div
          style={{
            backgroundImage: `url(${notfound})`, 
            height: '100vh', 
            width: '100vw', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
          }}
        >
          
        </div>
  )
}

export default Notfound