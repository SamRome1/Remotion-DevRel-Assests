import React from 'react';
import { OneToolScene } from '../scenes/oneTool';

export { ONE_TOOL_DURATION } from '../scenes/oneTool';

/**
 * OneTool — 16:9 YouTube explainer, white canvas (deliberate one-off).
 * VO: "We write code with it. We debug the code with it. We build entire apps
 * with it, generate the SQL, we argue with it in the middle of the night,
 * basically anything you can do with it. One tool, and in three years it
 * swallowed basically every job in software."
 */
export const OneTool: React.FC = () => <OneToolScene />;
