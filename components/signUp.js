import React, { Component } from "react";
import { View, Text, StyleSheet, TextInput, Modal } from "react-native";
import Button from "react-bootstrap/Button";

class SignUp extends Component {

	constructor(props) {
		super(props);

		this.state = {
			first_name: "",
			last_name: "",
			email: "",
			password: "",
			alert_message: "",
			placeholderColour: null,
			alertModalVisible: false
		};
	}

	signup = async () => {

		let state = this.state;
		let newUser = {first_name: "", last_name: "", email: "", password: ""};

		newUser["first_name"] = state.first_name;
		newUser["last_name"] = state.last_name;
		newUser["email"] = state.email;
		newUser["password"] = state.password;

		if(!state.first_name || !state.last_name || !state.email || !state.password)
		{this.setState({placeholderColour: "red"});}

		if (state.first_name.length > 20 || state.first_name.length < 1) {
			this.alertMessage("First Name must be between 1 and 20 characters");
		}
		else if (state.last_name.length > 20 || state.last_name.length < 1) {
			this.alertMessage("Last Name must be between 1 and 20 characters");
		}
		else if (!state.email.includes("@") || state.email.length < 1) {
			this.alertMessage("Invalid Email: Example Email Spacebook@Spacebook.com");
		}
		else if (state.password.length < 6) {
			this.alertMessage("Invalid Password: Password must be more than 6 charaters");
		}
		else {
			

			return fetch("http://localhost:3333/api/1.0.0/user", {
				method: "post",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(newUser)
			})
				.then((response) => {
					if (response.status === 201) {
						return response.json();
					} else if (response.status === 400) {
						throw "Error 400: Failed Validation";
					} else if (response.status === 500) {
						throw "Error 500: Server Error";
					} else {
						throw "Error: Something went wrong";
					}
				})
				.then((responseJson) => {
					console.log("User created with ID: ", responseJson);
					this.props.navigation.navigate("Sign In");
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

				<Text style={styles.mainTitle}>
					SpaceBook
				</Text>


				<Text style={styles.mainText}>
					Sign up to your Spacebook acount today.
				</Text>

				<TextInput
					style={styles.input}
					placeholder="Enter your first name..."
					placeholderTextColor={this.state.placeholderColour}
					onChangeText={(first_name) => this.setState({ first_name })}
				/>

				<TextInput
					style={styles.input}
					placeholder="Enter your last name..."
					placeholderTextColor={this.state.placeholderColour}
					onChangeText={(last_name) => this.setState({ last_name })}
				/>

				<TextInput
					style={styles.input}
					placeholder="Enter your email..."
					placeholderTextColor={this.state.placeholderColour}
					onChangeText={(email) => this.setState({ email })}
				/>

				<TextInput
					style={styles.input}
					placeholder="Enter your password..."
					placeholderTextColor={this.state.placeholderColour}
					onChangeText={(password) => this.setState({ password })}
					secureTextEntry
				/>

				<Button onClick={() => this.signup()}>Sign Up</Button>


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
	mainTitle:
	{
		fontSize: 40,
		fontWeight: "bold"
	},
	mainText:
	{
		fontSize: 20,
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

export default SignUp;