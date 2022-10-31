import React from 'react';
import {Button, Col, Container, Row} from "react-bootstrap";
import {Link} from "react-router-dom";

const HomePage = (props) => {
    return (
        <Container>
          <Row>
            <Col className="text-center m-4">
              <Row>
                <h1>Voting 3000-100</h1>
              </Row>
              <Row>
                <h3 className="text-muted">Make votes great again</h3>
              </Row>
            </Col>
          </Row>
          <Row>
            <img src="static/img/trump-voting.jpg" alt="How to vote."/>
          </Row>
          <Row>
            <Col className="text-center mt-5">
              <Link to="/create"><Button className="btn bg-success text-white font-weight-bold py-3 px-4"><strong>Create a <u>YUGE</u> election!</strong></Button></Link>
            </Col>
          </Row>
        </Container>
    );
};

export default HomePage;
