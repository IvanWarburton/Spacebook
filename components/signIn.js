import React, { Component } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "react-bootstrap/Button";

class SignIn extends Component {

	constructor(props){
		super(props);

		this.state = {email: "", password: ""};
	}

	login = async () => 
	{
		return fetch("http://localhost:3333/api/1.0.0/login", 
			{
				method: "post",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(this.state)
			}
		)

			.then((response) =>
			{
				if(response.status === 200){
					return response.json();
				}else if(response.status === 400){
					throw "Invalid email or password";
				}else{
					throw "Something went wrong";
				}
			})

			.then(async (responseJson) => 
			{
				console.log(responseJson);
				await AsyncStorage.setItem("@session_token", responseJson.token);
				await AsyncStorage.setItem("@user_id", responseJson.id);
				window.location.reload(false);
				console.log("Logged In");
			})

			.catch((error) => 
			{
				console.log(error);
			});
	};


	render() {
		return (
			<View style={styles.container}>

				<View style={styles.container2}>

					<Image 
						style={styles.logo}
						source={require("../assets/Spacebook_Icon.png")} 
					/>
                    
					<Text style={styles.mainTitle}>
                        SpaceBook
					</Text>

				</View>

				<Text style={styles.mainText}>
                    Sign up or Sign in to your Spacebook acount.
				</Text>

				<TextInput
					style={styles.input}
					placeholder="Email"
					onChangeText={(email) => this.setState({email})}
					value={this.state.email}
				/>

				<TextInput
					style={styles.input}
					placeholder="Password"
					onChangeText={(password) => this.setState({password})}
					value={this.state.password}
					secureTextEntry
				/>

				<Button onClick={() => this.login()}>Sign In</Button>
                    
				<Button onClick={() => this.props.navigation.navigate("Sign Up")}>Sign Up</Button>

			</View>

		);
	}
}

const styles = StyleSheet.create({
	container:
    {
    	flex: 1,
    	flexDirection: "column",
    	justifyContent: "space-evenly",
    	alignItems: "center"
    },
	container2:
    {
    	flexDirection: "row",
    	justifyContent: "space-evenly"
    },
	mainTitle:
    {
    	fontSize: 40,
    	fontWeight: "bold"
    },
	mainText:
    {
    	fontSize: 20,
    	padding: 10,
    	fontWeight: "bold"
    },
	button:
    {
    	padding: 10
    },
	input:
    {
    	margin: 40,
    	padding: 10,
    	width: "70%"
    },
	space:
    {
    	width: 20,
    	height: 20
    },
	logo:
    {
    	width: 100,
    	height: 100,
    	resizeMode: "contain"
    }
});

export default SignIn;