/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Footer from './Footer';

function HomePage() {
    return (
        <Container>
            <Row>
                <Col className="text-center m-4">
                    <Row>
                        <h1>Voting Application</h1>
                    </Row>
                </Col>
            </Row>
            <Row>
                <Col className="text-center mt-5">
                    <Link to="/create">
                        <Button className="btn bg-success text-white font-weight-bold py-3 px-4">
                            <strong>Setup election</strong>
                        </Button>
                    </Link>
                </Col>
            </Row>
            <Footer />
        </Container>
    );
}

export default HomePage;
