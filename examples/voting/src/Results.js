/* eslint-disable import/no-unresolved */
/* eslint-disable no-console */
/* eslint-disable react/prop-types */
/* eslint-disable consistent-return */
/* eslint-disable react/jsx-filename-extension */
import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import { Link, useParams } from 'react-router-dom';
import moment from 'moment';
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import { decodeVotingView } from './buffer';
import { getVotes } from './Wallet';
import { REFRESH_INTERVAL } from './config';

function VoteLink(props) {
    const { electionId, endsInMillis } = props;
    if (endsInMillis > 0) {
        return (
            <Row>
                <Col>
                    <Link to={`/vote/${electionId}`}>
                        <Button className="font-weight-bold">
                            <strong>Vote now</strong>
                        </Button>
                    </Link>
                </Col>
                <Col>Election ends in {moment.duration(endsInMillis).humanize()}.</Col>
            </Row>
        );
    }
    return (
        <Row>
            <Col>
                <Button className="font-weight-bold" disabled>
                    <strong>Too late!</strong>
                </Button>
            </Col>
            <Col>Election ended {moment.duration(endsInMillis).humanize()} ago.</Col>
        </Row>
    );
}

function Results() {
    const params = useParams();
    const { electionId } = params;

    const [client, setClient] = useState();

    // Attempt to initialize Browser Wallet Client.
    useEffect(() => {
        detectConcordiumProvider().then(setClient).catch(console.error);
    }, []);

    const [getvotesResult, setGetvotesResult] = useState();
    // Decode raw result (which is fetched below).
    const votes = useMemo(() => {
        if (getvotesResult) {
            return decodeVotingView(getvotesResult.returnValue);
        }
    }, [getvotesResult]);

    // Refresh time to deadline each second.
    const [now, setNow] = useState(moment());
    useEffect(() => {
        const interval = setInterval(() => setNow(moment()), moment.duration(1, 'second').asMilliseconds());
        return () => clearInterval(interval);
    }, []);
    const endsInMillis = votes?.endTime.diff(now);

    // Fetch tally once client is initialized.
    useEffect(() => {
        if (client) {
            getVotes(client, electionId).then(setGetvotesResult).catch(console.error);
        }
    }, [client, electionId]);
    // Refresh tally periodically until deadline.
    useEffect(() => {
        if (client && votes?.endTime.isAfter()) {
            const interval = setInterval(() => {
                console.log('refreshing');
                setGetvotesResult(undefined);
                getVotes(client, electionId).then(setGetvotesResult).catch(console.error);
            }, REFRESH_INTERVAL.asMilliseconds());
            return () => clearInterval(interval);
        }
    }, [client, electionId, votes]);

    const maxVoteCount = useMemo(() => {
        if (votes) {
            return Math.max(...Object.values(votes.tally));
        }
    }, [votes]);

    return (
        <Container>
            <Row>
                <Col>
                    <h1>Results for Election {electionId}*</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2>{votes?.descriptionText}</h2>
                </Col>
            </Row>
            <Row>
                <Col>
                    <ListGroup numbered className="mb-3">
                        {!votes && <Spinner animation="border" />}
                        {votes &&
                            Object.entries(votes.tally).map(([name, count]) => (
                                <ListGroup.Item
                                    className="d-flex justify-content-between align-items-start"
                                    style={{
                                        background: `linear-gradient(90deg, rgba(100,200,255,1) ${
                                            (100 * count) / maxVoteCount
                                        }%, rgba(0,0,0,0) ${(100 * count) / maxVoteCount}%)`,
                                    }}
                                    key={name}
                                >
                                    <div className="ms-2 me-auto">{name}</div>
                                    <Badge bg="primary" pill>
                                        {count}
                                    </Badge>
                                </ListGroup.Item>
                            ))}
                    </ListGroup>
                </Col>
            </Row>
            {endsInMillis && <VoteLink endsInMillis={endsInMillis} electionId={electionId} />}
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

export default Results;
