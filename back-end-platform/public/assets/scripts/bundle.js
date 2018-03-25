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
  			let uri = "http://localhost:8080/rmp/" + schoolName; //have to use something else not localhost
  			let temp;
  			let _this = this;
  			var result = fetch(uri).then(response =>{
  				temp = response.json();
  				return temp;
  			}).then(function(data){
  				//console.log(data);
  				_this.setState((prevState, props) => {
				  return {RMPUniInfo:data};
				});
  			}); 			
  		}

  		componentWillMount(){
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
				const food = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.FOOD);
				const internet = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.INTERNET);
				const reputation = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.REPUTATION);
				const clubs = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.CLUBS);
				const facilities = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.FACILITIES);
				const location = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.LOCATION);
				const oppurtunity = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.OPPORTUNITY);
				const social = React.createElement("i",{className:"fas fa-utensils"},": "+ RMPData.SOCIAL);
				const container = React.createElement('div', {}, [title, food, internet,reputation, clubs, facilities, oppurtunity, social]);
				
				return container;}
			//ELSE
            return React.createElement('div', null, "loading..." + '!');
        }



  	}

  	return RMPComp;
  }

  createSearchComp(){
  	var searchComp = class searchComp extends React.Component{

  		constructor(){
  			super();
  			this.state = {};
  		}

  		updateInputValue(evt){
		    this.setState({
		      inputValue: evt.target.value
		    });
		  }

  		render(){
  		var _this = this;
  		const input = React.createElement('input', {className:"form-control nav_input","type":"text", onChange: 
  			function(evt){

  			 	_this.setState({
			      inputValue: evt.target.value
			    });
  			 }
  		});


  		const btn = React.createElement('button', {type:"button", className:"btn btn-primary",
  		style:{color:'black'},

  		 onClick:
  			function(e){
	  			e.preventDefault();
	  			let schoolName = _this.state.inputValue;
	  			if(schoolName == null || schoolName == undefined || schoolName == ""){
	  				return false;
	  			}
	  			console.log(schoolName);
	  			schoolName = schoolName.replace(" ","+");
	  			//redirect user to 
  				window.location.replace("http://localhost:8080/schoolreport/" + schoolName);	//switch localhost with something global variable
  			}

  		}, "Search");
  		const span = React.createElement('span', {className:"input-group-btn"}, [btn]);

		const container = React.createElement('div', {}, [input,span]);
  		return container;

  		}
  	}



  	return searchComp;
}

  

  /*******************
  	Helper Functions
  ********************/

  rmpHelper(schoolName){
  	let RMPComp = this.createRMPComp(schoolName);

  	ReactDOM.render(
                    React.createElement(RMPComp, {}),
                    document.getElementById('rmp')
    );
  }

  searchHelper(){
  	let searchComp = this.createSearchComp();
  	ReactDOM.render(
                    React.createElement(searchComp, {}),
                    document.getElementById('nav-search')
    );

  }



}

