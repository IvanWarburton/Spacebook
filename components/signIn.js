/* global require */ //Requirein image coming up as not defined in Eslint 
import React, { Component } from "react";
import { View, Text, StyleSheet, Image, Modal } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "react-bootstrap/Button";

class SignIn extends Component {

	constructor(props) {
		super(props);

		this.state = { 
			email: "", 
			password: "",
			alert_message: "",
			placeholderColour: null,
			alertModalVisible: false 
		};
	}

	login = async () => {

		let state = this.state;
		let user = {email: "", password: ""};

		user["email"] = state.email;
		user["password"] = state.password;
		console.log(user);

		if (!state.first_name || !state.last_name || !state.email || !state.password) { this.setState({ placeholderColour: "red" }); }

		if (state.email.length < 1) {
			this.alertMessage("Please Enter your Email");
			this.setState({placeholderColour: "red"});
		}
		else if (state.password.length < 1) {
			this.alertMessage("Please Enter your Password");
			this.setState({placeholderColour: "red"});
		}
		else {
			return fetch("http://localhost:3333/api/1.0.0/login",
				{
					method: "post",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(user)
				}
			)

				.then((response) => {
					if (response.status === 200) {
						return response.json();
					} else if (response.status === 400) {
						this.alertMessage("Error 400: Failed Validation");
					} else if (response.status === 500) {
						this.alertMessage("Error 500: Server Error");
					} else {
						this.alertMessage("Error: Something went wrong");
					}
				})

				.then(async (responseJson) => {
					await AsyncStorage.setItem("@session_token", responseJson.token);
					await AsyncStorage.setItem("@user_id", responseJson.id);
					window.location.reload(false);
				})

				.catch((error) => {
					this.alertMessage(error);
				});
		}
	};

	alertMessage(message) {
		this.setState({
			alertModalVisible: true,
			alertModalMesssage: message
		});
	}


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
					placeholderTextColor={this.state.placeholderColour}
					onChangeText={(email) => this.setState({ email })}
				/>

				<TextInput
					style={styles.input}
					placeholder="Password"
					placeholderTextColor={this.state.placeholderColour}
					onChangeText={(password) => this.setState({ password })}
					secureTextEntry
				/>

				<Button onClick={() => this.login()}>Sign In</Button>

				<Button onClick={() => this.props.navigation.navigate("Sign Up")}>Sign Up</Button>

				<View>
					<Modal visible={this.state.alertModalVisible}
						animationType="fade"
						transparent={true}>

						<View style={styles.alertModal}>
							<Text style={styles.mainText}>ALERT</Text>
							<Text style={styles.mainText}>{this.state.alertModalMesssage}</Text>
							<Button onClick={() => this.setState({ alertModalVisible: false })}>Close</Button>
						</View>

					</Modal>
				</View>

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
		justifyContent: "space-evenly",
		alignItems: "center",
		width: "80%"
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
		fontWeight: "bold",
		textAlign: "center"
	},
	input:
	{
		padding: 10,
		fontSize: 15,
		fontWeight: "bold",
		width: "70%",
		borderRadius: 20,
		textAlign: "center",
		backgroundColor: "#D1D1D1"
	},
	logo:
	{
		width: 100,
		height: 100,
		resizeMode: "contain"
	},
	alertModal:
	{
		flex: 1,
		justifyContent: "space-evenly",
		margin: 20,
		marginVertical: "90%",
		backgroundColor: "#ffd4d8",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		textAlign: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5
	}
});

export default SignIn;