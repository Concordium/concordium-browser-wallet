/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable react/jsx-filename-extension */
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import Wallet, { castVote, getVotes, init } from './Wallet';
import { decodeVotingView } from './buffer';

function VotePage() {
    const params = useParams();
    const { electionId } = params;

    const [client, setClient] = useState();
    const [connectedAccount, setConnectedAccount] = useState();
    const [getvotesResult, setGetvotesResult] = useState();

    const [selectedOption, setSelectionOption] = useState();

    // Attempt to initialize Browser Wallet Client.
    useEffect(() => {
        init(setConnectedAccount).then(setClient).catch(console.error);
    }, []);

    // Fetch votes from contract.
    useEffect(() => {
        if (client) {
            getVotes(client, electionId).then(setGetvotesResult).catch(console.error);
        }
    }, [client, electionId]);

    const votes = useMemo(() => {
        if (getvotesResult) {
            return decodeVotingView(getvotesResult.returnValue);
        }
    }, [getvotesResult]);

    return (
        <Container>
            <Row>
                <Col>
                    <Wallet
                        client={client}
                        connectedAccount={connectedAccount}
                        setConnectedAccount={setConnectedAccount}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <h1>Vote in Election {electionId}*</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2>{votes?.descriptionText}</h2>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form>
                        <div className="mb-3">
                            {votes?.opts.map((v) => (
                                <Form.Check key={v} type="radio" id={`default-radio-${v}`}>
                                    <Form.Check.Input
                                        className="btn-check"
                                        type="radio"
                                        onChange={() => setSelectionOption(v)}
                                        checked={selectedOption === v}
                                    />
                                    <Form.Check.Label className="btn btn-light w-100">{v}</Form.Check.Label>
                                </Form.Check>
                            ))}
                        </div>
                        <Button
                            className="w-100"
                            onClick={() =>
                                castVote(client, electionId, votes?.opts.indexOf(selectedOption), connectedAccount)
                            }
                        >
                            <strong>Cast Vote!</strong>
                        </Button>
                    </Form>
                    <ul />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Link to={`/results/${electionId}`}>
                        <Button className="btn-secondary font-weight-bold">
                            <strong>Results</strong>
                        </Button>
                    </Link>
                </Col>
            </Row>
            <br />
            <br />
            <br />
            <br />
            <footer>
                <p>*Smart contract index on the Concordium chain</p>
            </footer>
        </Container>
    );
}

export default VotePage;
