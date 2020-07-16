import React from 'react';
import { useParams } from "react-router-dom";

export function getParams()
{
    let { id } = useParams();
    return id;
}
