module.exports = function(props){
   var error = props.error;
   var message = props.message;
   var stack = props.stack;
   return `
      <div>
         <p>
            <strong>
                ${message}
            </strong>
         </p>
         ${error ? JSON.stringify(error) : ''}
         ${stack}
      </div>
    `;
}
