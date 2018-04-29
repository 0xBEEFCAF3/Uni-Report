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
  			var result = fetch(uri,{credentials: 'same-origin'}).then(response =>{
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

  			if(this.state.RMPUniInfo){

  				let RMPData = this.state.RMPUniInfo;

  			const title = React.createElement('h1', {}, 'University Campus Properties');
				const food = React.createElement("i",{className:"fas fa-utensils",style:{"fontSize":"20px","paddingRight": "10px"}},": "+ RMPData.FOOD + "-- Food");
				const internet = React.createElement("i",{className:"fas fa-desktop",style:{"fontSize":"20px","paddingRight": "10px"}},": "+ RMPData.INTERNET + "-- Internet");
				const reputation = React.createElement("i",{className:"fas fa-book",style:{"fontSize":"20px","paddingRight": "10px"}},": "+ RMPData.REPUTATION + "-- Reputation");
				const clubs = React.createElement("i",{className:"fas fa-users",style:{"fontSize":"20px","paddingRight": "10px"}},": "+ RMPData.CLUBS + "-- Clubs");
				const facilities = React.createElement("i",{className:"fas fa-building",style:{"fontSize":"20px","paddingRight": "10px"}},": "+ RMPData.FACILITIES + "-- Facilities");
				const location = React.createElement("i",{className:"fas fa-map-marker",style:{"fontSize":"20px","paddingRight": "10px"}},": "+ RMPData.LOCATION + "-- Location");
				const oppurtunity = React.createElement("i",{className:"fas fa-handshake",style:{"fontSize":"20px","paddingRight": "10px"}},": "+ RMPData.OPPORTUNITY + "-- Opportunity");
				const social = React.createElement("i",{className:"fas fa-user",style:{"fontSize":"20px","paddingRight": "10px"}},": "+ RMPData.SOCIAL + "-- Social");
				const container = React.createElement('div', {}, [title, food, internet,reputation, clubs, facilities, oppurtunity, social]);
				
				return container;}
			//ELSE
            return React.createElement('div', null, "loading..." + '!');
        }



  	}

  	return RMPComp;
  }

  createStandTestComp(schoolName){
    var standTestComp = class standTestComp extends React.Component{

      constructor(){
        super();
        this.state = {};
      }

      fetchActInfo(){
        console.log("ACT");
        let uri = "http://localhost:8080/act/" + schoolName; //have to use something else not localhost
        let temp;
        let _this = this;
        var result = fetch(uri,{credentials: 'same-origin'}).then(response =>{
          temp = response.json();
          return temp;
        }).then(function(data){
          console.log(data);
          _this.setState((prevState, props) => {
            return {actScores:data};
          });
        });       
      }

      fetchSatInfo(){
        console.log("SAT");
        console.log(this.state);
        let uri = "http://localhost:8080/sat/" + schoolName; 
        let temp;
        let _this = this;
        var result = fetch(uri,{credentials: 'same-origin'}).then(response =>{
          temp = response.json();
          return temp;
        }).then(function(data){
            _this.setState({satScores:data});
        });       
      }

      componentWillMount(){
        this.fetchSatInfo();
        this.fetchActInfo();
      }

      render(){
            if(this.state.actScores && this.state.satScores ){
              let satInfo = this.state.satScores;
              let actInfo = this.state.actScores;

              const satMath = React.createElement('p', {style:{"fontSize":"20px","paddingRight": "10px"}}, "Avg Math: " + satInfo.SAT_Math );
              const satReading = React.createElement('p', {style:{"fontSize":"20px","paddingRight": "10px"}}, "Avg Reading: " + satInfo.SAT_Reading );
              const satWriting = React.createElement('p', {style:{"fontSize":"20px","paddingRight": "10px"}}, "Avg Writing: " + satInfo.SAT_Writing );
              const satContainer = React.createElement('div', null, "", [satMath, satReading, satWriting]);

              //ACT
              const actMath = React.createElement('p', {style:{"fontSize":"20px","paddingRight": "10px"}}, "Avg Math: " + actInfo.ACT_Math );
              const actEnglish = React.createElement('p', {style:{"fontSize":"20px","paddingRight": "10px"}}, "Avg English: " + actInfo.ACT_English);
              const actWriting = React.createElement('p', {style:{"fontSize":"20px","paddingRight": "10px"}}, "Avg Writing: " + actInfo.ACT_Writing );
              const actContainer = React.createElement('div', null, "", [actMath, actEnglish, actWriting]);

              //container
              const container = React.createElement('div', null, "", [satContainer, actContainer]);

              return container;
            }
          
            return React.createElement('div', null, "loading..." + '!');
        }
  }

    return standTestComp;

  }

  createEarningComp(schoolName){
    var earningComp = class earningComp extends React.Component{

      constructor(){
        super();
        this.state = {};
      }

      fetchEarnings(){
        let uri = "http://localhost:8080/earnings/avg/" + schoolName; 
        let temp;
        let _this = this;
        var result = fetch(uri,{credentials: 'same-origin'}).then(response =>{
          temp = response.json();
          return temp;
        }).then(function(data){
            _this.setState({mean:data.mean, median:data.median});
        });       
      }

      componentWillMount(){
        this.fetchEarnings();
      }

      render(){
            if(this.state.mean){
              let mean = this.state.mean;
              let median = this.state.median;
              const meanElement = React.createElement('p', {style:{"fontSize":"20px","paddingRight": "10px"}}, "Average salary after 10 years: " + mean);
              const medianElement = React.createElement('p', {style:{"fontSize":"20px","paddingRight": "10px"}}, "Meadian salary after 10 years: " + median );
              const container = React.createElement('div', null, "", [meanElement, medianElement]);

              return container;
            }
          
            return React.createElement('div', null, "loading..." + '!');
        }
  }
    return earningComp;
  }
  createLocationComp(schoolName){
    var locationComp = class locationComp extends React.Component{
      constructor(){
        super();
        this.state = {};
      }

      fetchEarnings(){
        let uri = "http://localhost:8080/location/" + schoolName; 
        let temp;
        let _this = this;
        var result = fetch(uri,{credentials: 'same-origin'}).then(response =>{
          temp = response.json();
          return temp;
        }).then(function(data){
            _this.setState({rating:data.rating, dollars:data.dollars});
        });       
      }

      componentWillMount(){
        this.fetchEarnings();
      }

      render(){
            if(this.state.rating){
              let rating = this.state.rating;
              let dollars = this.state.dollars;
              const meanElement = React.createElement('p', {style:{"fontSize":"20px","paddingRight": "10px"}}, "Average Eatery rating: " + rating);
              const dollarElement = React.createElement('p', {style:{"fontSize":"20px","paddingRight": "10px"}}, "Average Eatery price: " + {1:"$", 2:"$$",3:"$$$"}[dollars] );
              const container = React.createElement('div', null, "", [meanElement, dollarElement]);

              return container;
            }
          
            return React.createElement('div', null, "loading..." + '!');
        }
  }
    return locationComp;
  }

  createInformationComp(schoolName){
    var informationComp = class informationComp extends React.Component{
      constructor(){
        super();
        this.state = {};
      }

      fetchUniInfo(){
        let uri = "http://localhost:8080/info/" + schoolName; 
        let temp;
        let _this = this;
        var result = fetch(uri,{credentials: 'same-origin'}).then(response =>{
          temp = response.json();
          return temp;
        }).then(function(data){
            _this.setState({state:data.state, city:data.city, zip:data.zip, school_url:data.school_url, title:data.title});
        });       
      }

      componentWillMount(){
        this.fetchUniInfo();
      }

      render(){
            if(this.state.state){
              let state = this.state.state;
              let city = this.state.city;
              let zip = this.state.zip;
              let school_url = this.state.school_url;
              let title = this.state.title;
              const addressElement = React.createElement('p', {style:{"fontSize":"20px","paddingRight": "10px"}}, "Address: " + city + ", " + state + " " + zip);
              const titleElement = React.createElement('p', {style:{"fontSize":"20px","paddingRight": "10px"}}, "University: " + title );
              const urlElement = React.createElement('p', {style:{"fontSize":"20px","paddingRight": "10px"}}, "Website Link: " + school_url );
              const container = React.createElement('div', null, "", [addressElement, urlElement]);

              return container;
            }
          
            return React.createElement('div', null, "loading..." + '!');
        }
  }
    return informationComp;
  }

  createCalcComp(schoolName){
    var calcComp = class calcComp extends React.Component{
      constructor(){
        super();
        this.state = {};
      }

      fetchPriceInfo(){
        let uri = "http://localhost:8080/price/" + schoolName; 
        let temp;
        let _this = this;
        var result = fetch(uri,{credentials: 'same-origin'}).then(response =>{
          temp = response.json();
          return temp;
        }).then(function(data){
            _this.setState({price:data.price});
        });       
      }

      componentWillMount(){
        this.fetchPriceInfo();
      }

      render(){
            if(this.state.price){
              let state = this.state.price;
              const priceElement = React.createElement('p', {style:{"fontSize":"20px","paddingRight": "10px"}}, "Tuition: " + "$" + price);
              const container = React.createElement('div', null, "", [priceElement]);

              return container;
            }
          
            return React.createElement('div', null, "loading..." + '!');
        }
  }
    return calcComp;
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

  createLikeComp(uniName){
    var likeComp = class likeComp extends React.Component{

      constructor(){
        super();
        this.state = {};
        this.uniName = uniName;
      }

      render(){
        var _this = this;

        let likeIcon = React.createElement('i', {className:"fas fa-thumbs-up"} );
        let likeButton = React.createElement('button', {className:"btn btn-large btn-success",style:{margin:"5px"},onClick:function (){
        let body =  JSON.stringify({"uniName": (_this.uniName.replace("+", " "))});
        console.log(body);
        fetch('/updateLikes', {
             method: 'post',
             headers: {'Content-Type':'application/json'},
             body: body
        });
        }},"Like this University",[likeIcon]);

          const container = React.createElement('div', {}, [likeButton]);
          return container;
      }
    }

    return likeComp;
}

createGetLikesComp(){
    var getLikesComp = class getLikesComp extends React.Component{

      constructor(){
        super();
        this.state = {};
      }
      fetchLikedUnis(){
        let uri = "http://localhost:8080/getLikedUnis"; //have to use something else not localhost
        let temp;
        let _this = this;
        var result = fetch(uri).then(response =>{
          temp = response.json();
          return temp;
        }).then(function(data){
          //console.log(data);
          _this.setState((prevState, props) => {
            return {likeUnis:data};
          });
        });       
      }

      componentWillMount(){
        this.fetchLikedUnis();
      }
      render(){
        if(this.state.likeUnis){
          let unis = [];
          this.state.likeUnis.forEach(function(uni){
              let link = React.createElement('a', {href:"/schoolreport/"+ uni.replace(" ", "+")}, uni);
              let temp = React.createElement('p', null, null, [link] );
              unis.push(temp);
          });           
          const container = React.createElement('div', {}, [unis]);
          return container;
        }else{
          return React.createElement('div', null, "loading..." + '!');
        }

      }
  }
    return getLikesComp;
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

  likeUniHelper(schoolName){
    let likeComp = this.createLikeComp(schoolName);
    ReactDOM.render(
                    React.createElement(likeComp, {}),
                    document.getElementById('like-uni')
    );
  }

  satActHelper(schoolName){
    let standTestComp = this.createStandTestComp(schoolName);
    console.log(standTestComp);

    
    ReactDOM.render(
                    React.createElement(standTestComp, {}),
                    document.getElementById('standTestComp')
    );
  }

  earningHelper(schoolName){
    let earningComp = this.createEarningComp(schoolName);
    
    ReactDOM.render(
                    React.createElement(earningComp, {}),
                    document.getElementById('earningHelper')
    );
  }

  locationHelper(schoolName){
    let locationComp = this.createLocationComp(schoolName);
    
    ReactDOM.render(
                    React.createElement(locationComp, {}),
                    document.getElementById('locationComp')
    );
  }

  informationHelper(schoolName){
    let informationComp = this.createInformationComp(schoolName);
    
    ReactDOM.render(
                    React.createElement(informationComp, {}),
                    document.getElementById('informationComp')
    );
  }

  priceCalcHelper(schoolName){
    let calcComp = this.createCalcComp(schoolName);
    
    ReactDOM.render(
                    React.createElement(calcComp, {}),
                    document.getElementById('calcComp')
    );
  }

  getLikesHelper(){
    let createGetLikesComp = this.createGetLikesComp();
    ReactDOM.render(
                    React.createElement(createGetLikesComp, {}),
                    document.getElementById('likes')
    );
  }



}

