var Bundle = class Bundle {

  constructor(){
  }

  createRMPComp(schoolName){
  	var RMPComp = class RMPComp extends React.Component{

  		constructor(){
  			super();
  			this.state = {};
  		}

  		fetchRMPInfo(){
  			let uri = "http://localhost:8080/rmp/" + schoolName;
  			let temp;
  			let _this = this;
  			var result = fetch(uri).then(response =>{
  				temp = response.json();
  				return temp;
  				//console.log(temp);
  			}).then(function(data){
  				//console.log(data);
  				_this.setState((prevState, props) => {
				  return {RMPUniInfo:data};
				});
  			}); 			
  		}

  		componentWillMount(){
  			//console.log("did it mount");
  			this.fetchRMPInfo();
  			
  		}

  		render(){
  			console.log("in render");

  			if(this.state.RMPUniInfo){

  				let RMPData = this.state.RMPUniInfo;
  				console.log(RMPData);

  				/*
  				const uniProperty = RMPData.map((property)=>{
  					return React.createElement('li', );
  				});
  				*/

  				const title = React.createElement('h1', {}, 'University Properties');
				//const paragraph = React.createElement('p', {}, 'Writing some more HTML. Cool stuff!');
				const food = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.FOOD);
				const internet = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.INTERNET);
				const reputation = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.REPUTATION);
				const clubs = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.CLUBS);
				const facilities = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.FACILITIES);
				const location = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.LOCATION);
				const oppurtunity = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.OPPORTUNITY);
				const social = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.SOCIAL);
				const container = React.createElement('div', {}, [title, food, internet,reputation, clubs, facilities, oppurtunity, social]);
				/*
  				return React.createElement("div", {}, 
					  "University Properties:",
					  React.createElement("i",{className:"fas fa-utensils"},"Food",
					  React.createElement("i",{className:"fas fa-browser"},"Internet")
					)
			)};*/
				return container;}

            return React.createElement('div', null, "loading..." + '!');
        }



  	}

  	return RMPComp;
  }


  rmpProperty(){
  	var RMPProperty = class RMPComp extends React.Component{



  	}

  	return RMPProperty;

  }

  

  rmpHelper(schoolName){
  	let RMPComp = this.createRMPComp(schoolName);

  	ReactDOM.render(
                    React.createElement(RMPComp, { name : 'Armin' }),
                    document.getElementById('rmp')
    );
  }



}

