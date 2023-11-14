
export function Loader({text, className = null}) {
  const content = text ? text : 'Loading...';
  const parentClass = className ? className : 'full-screen-loader';
  return (
    <div className={parentClass}>
      <div className="loader-content">
        <span className="loader"></span>
        <h1 className="mt-10 font-medium ml-10 text-center text-2xl md:text-3xl">{content}</h1> 
      </div>
    </div>
  );
}