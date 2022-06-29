import React from 'react';
import Button from '../Button';
import ButtonGroup from '../ButtonGroup';

export default function Carousel() {
    return (
        <div className="carousel">
            <div className="carousel__content">Carousel</div>
            <div className="carousel__divider" />
            <div className="carousel__dots">dots</div>
            <ButtonGroup className="carousel__actions">
                <Button faded>Skip</Button>
                <Button>Next</Button>
            </ButtonGroup>
        </div>
    );
}
