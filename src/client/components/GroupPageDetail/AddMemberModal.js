import React, { Component } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Validator from "validator";
import GlobalAlert from "../Common/GlobalAlert";
import axios from "axios";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setAlert, hideAlert } from "../../actions/alert";
import { addMemberRequest } from "../../request/group";

class AddMemberModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
    };
  }

  handleChange = (e) => {
    this.setState({ ...this.state, [e.target.name]: e.target.value });
  };
  handleCloseButton = () => {
    this.setState({
      ...this.state,
      email: "",
      err: "",
      showAlert: false,
    });
    this.props.hideAlert();
    this.props.handleClose();
  };
  handleClickAddMember = async () => {
    if (this.state.email == "") {
      if (this.state.err != "") {
        this.props.setAlert("danger", "Email is empty");
        return -1;
      }
      this.props.setAlert("danger", "Email is empty");
      return -1;
    }
    if (!Validator.isEmail(this.state.email)) {
      this.props.setAlert("danger", "Invalid email");
      return -1;
    }
    let addMemberResult = await addMemberRequest(
      this.props.match.params.groupId,
      this.state.email,
      this.props.token || this.props.location.state.token
    );
    this.props.setAlert(
      addMemberResult.status ? "success" : "danger",
      addMemberResult.message
    );
  };
  componentWillUnmount() {
    this.props.hideAlert();
  }
  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.props.showAlert ? (
            <GlobalAlert
              alertType={this.props.type}
              toggleAlert={this.props.hideAlert}
              message={this.props.message}
            />
          ) : (
            <></>
          )}
          <Form.Group>
            <Form.Label>Member Email: </Form.Label>
            <Form.Control
              size="lg"
              type="email"
              name="email"
              placeholder="abcdxy@example.com"
              onChange={this.handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            style={{
              backgroundColor: "#FF5522",
              color: "#080024",
              border: "none",
            }}
            variant="primary"
            onClick={this.handleClickAddMember}
          >
            Add Member
          </Button>
          <Button
            style={{
              backgroundColor: "#48BDFF",
              color: "#080024",
              border: "none",
            }}
            variant="secondary"
            onClick={() => {
              this.handleCloseButton();
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.alert,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setAlert, hideAlert }, dispatch);
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddMemberModal)
);