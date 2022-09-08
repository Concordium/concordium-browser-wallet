import React from 'react';

export default function ExternalLink({ path, label }: { path: string; label: string }) {
    return (
        <a href={`${path}`} target="_blank" rel="noreferrer">
            {label}
        </a>
    );
}
