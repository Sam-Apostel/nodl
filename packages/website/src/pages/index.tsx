import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import * as React from 'react';

import { ThreeExample } from '../examples/Three/ThreeExample';
import styles from './index.module.css';
import { MESExample } from '@site/src/examples/MES/MESExample';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx('hero', styles.heroBanner)}>
            <div className="container">
                <h1 className="hero__title">{siteConfig.title}</h1>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
                <div className={styles.buttons}>
                    <Link className="button button--secondary button--lg" to="/docs/intro">
                        Get Started
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();

    return (
        <BrowserOnly>
            {() => (
                <Layout description={siteConfig.tagline}>

                    {/*<ThreeExample />*/}
                    <MESExample state={{
                        nodes: [
                            {
                                id: 'root',
                                name: 'SLA Print',
                                category: 'ROOT',
                                inputParameters: [],
                                outputParameters: [
                                    {
                                        id: '0',
                                        type: 'Part',
                                        name: 'Part',
                                    },
                                    {
                                        id: '1',
                                        type: 'Text',
                                        name: 'Finishing',
                                    },
                                ],
                                position: { x: -700, y: 0 }
                            },
                            {
                                id: '0',
                                name: 'Data Prep',
                                category: 'pre-print',
                                inputParameters: [
                                    {
                                        id: '0',
                                        type: 'Part',
                                        name: 'Part',
                                    },
                                    {
                                        id: '1',
                                        type: 'number',
                                        name: 'Machine Type ID',
                                    },
                                ],
                                outputParameters: [
                                    {
                                        id: '0',
                                        type: 'Platform',
                                        name: 'Platform',
                                    },
                                ],

                                position: { x: -300, y: 60 }
                            },
                            {
                                id: '1',
                                name: 'SLA Printing',
                                category: 'printing',
                                inputParameters: [
                                    {
                                        id: '0',
                                        type: 'Platform',
                                        name: 'Platform',
                                    },
                                    {
                                        id: '1',
                                        type: 'number',
                                        name: 'Build Plate Number',
                                    },
                                ],
                                outputParameters: [
                                    {
                                        id: '0',
                                        type: 'number',
                                        name: 'Build ID',
                                    },
                                ],
                                position: { x: 100, y: 60 }
                            },
                            {
                                id: '2',
                                name: 'Cleaning',
                                category: 'post-processing',
                                inputParameters: [
                                    {
                                        id: '0',
                                        type: 'number',
                                        name: 'Build ID',
                                    },
                                ],
                                outputParameters: [
                                    {
                                        id: '0',
                                        type: 'number',
                                        name: 'Physical Part ID',
                                    },
                                ],
                                position: { x: 500, y: 60 }
                            },
                            {
                                id: '3',
                                name: 'Sanding',
                                category: 'post-processing',
                                inputParameters: [
                                    {
                                        id: '0',
                                        type: 'number',
                                        name: 'Physical Part ID',
                                    },
                                    {
                                        id: '1',
                                        type: 'Text',
                                        name: 'Finishing',
                                    },
                                ],
                                outputParameters: [
                                    {
                                        id: '0',
                                        type: 'number',
                                        name: 'Physical Part ID',
                                    },
                                ],
                                position: { x: 900, y: 0 }
                            },
                        ],
                        connections: [
                            {
                                id: '0',
                                from: {
                                    node: 'root',
                                    parameter: '0'
                                },
                                to: {
                                    node: '0',
                                    parameter: '0',
                                }
                            },
                            {
                                id: '1',
                                from: {
                                    node: '0',
                                    parameter: '0'
                                },
                                to: {
                                    node: '1',
                                    parameter: '0',
                                }
                            },
                            {
                                id: '2',
                                from: {
                                    node: '1',
                                    parameter: '0'
                                },
                                to: {
                                    node: '2',
                                    parameter: '0',
                                }
                            },
                            {
                                id: '3',
                                from: {
                                    node: '2',
                                    parameter: '0'
                                },
                                to: {
                                    node: '3',
                                    parameter: '0',
                                }
                            },
                            {
                                id: '4',
                                from: {
                                    node: 'root',
                                    parameter: '1'
                                },
                                to: {
                                    node: '3',
                                    parameter: '1',
                                }
                            }
                        ],
                    }}/>
                </Layout>
            )}
        </BrowserOnly>
    );
}
