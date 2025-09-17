pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'elms-app'
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        REPORT_DIR = 'reports'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git credentialsId: 'your-github-credentials-id', url: 'https://github.com/DevaseeshKumar/ELMS-DevOps.git', branch: 'main'
            }
        }

        stage('Write .env') {
            steps {
                writeFile file: '.env', text: '''\
mongodburl=mongodb+srv://ELMS:ELMS@cluster0.uqtzdbr.mongodb.net/elms?retryWrites=true&w=majority&appName=Cluster0
PORT=8000
EMAIL_USER=thorodinsonuru@gmail.com
EMAIL_PASS=qzerfjxnvoeupsgp
FRONTEND_URL=https://localhost:5173
SESSION_SECRET=elms-secret-key
NODE_ENV=production
'''
            }
        }

        stage('Package Scan - Backend') {
            steps {
                script {
                    bat "mkdir ${REPORT_DIR} || exit 0"
                    bat "cd /d ${env.BACKEND_DIR} && npm install"
                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                        bat "cd /d ${env.BACKEND_DIR} && npx snyk test --severity-threshold=high --json > ..\\${REPORT_DIR}\\backend-snyk.json"
                    }
                }
            }
        }

        stage('Package Scan - Frontend') {
            steps {
                script {
                    bat "cd /d ${env.FRONTEND_DIR} && npm install"
                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                        bat "cd /d ${env.FRONTEND_DIR} && npx snyk test --severity-threshold=high --json > ..\\${REPORT_DIR}\\frontend-snyk.json"
                    }
                }
            }
        }

        stage('Generate Snyk HTML Report') {
            steps {
                script {
                    echo '📄 Generating Snyk HTML reports...'
                    bat "mkdir ${REPORT_DIR} || exit 0"

                    bat """
                    npx snyk-to-html -i ${REPORT_DIR}\\backend-snyk.json -o ${REPORT_DIR}\\backend-snyk.html || echo "No backend report"
                    """

                    bat """
                    npx snyk-to-html -i ${REPORT_DIR}\\frontend-snyk.json -o ${REPORT_DIR}\\frontend-snyk.html || echo "No frontend report"
                    """

                    // Create a summary HTML
                    writeFile file: "${REPORT_DIR}/scan-summary.html", text: """
                    <html>
                        <head><title>Snyk Scan Summary</title></head>
                        <body>
                            <h2>Snyk Security Scan Summary</h2>
                            <ul>
                                <li><a href="backend-snyk.html">Backend Report</a></li>
                                <li><a href="frontend-snyk.html">Frontend Report</a></li>
                            </ul>
                            <p><b>Note:</b> If this pipeline failed, it means one or more 
                            <span style="color:red">High/Critical</span> vulnerabilities were detected.</p>
                        </body>
                    </html>
                    """
                }
            }
        }

        stage('Build & Deploy') {
            when {
                expression { currentBuild.resultIsBetterOrEqualTo('SUCCESS') }
            }
            steps {
                script {
                    def downCmd = 'docker compose -f docker-compose.yml down || exit 0'
                    def upCmd = 'docker compose -f docker-compose.yml up --build -d'

                    bat downCmd
                    bat upCmd
                }
            }
        }

        stage('Container Security Scan') {
            steps {
                echo '🛡️ Container security scan placeholder (implement Trivy/Clair here)'
            }
        }
    }

    post {
        always {
            echo '📂 Archiving Snyk HTML reports...'
            archiveArtifacts artifacts: 'reports/*.html', allowEmptyArchive: true

            // ✅ Publish all reports as tabs in Jenkins UI
            publishHTML(target: [
                reportName: 'Snyk Summary',
                reportDir: "${REPORT_DIR}",
                reportFiles: 'scan-summary.html',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: true
            ])

            publishHTML(target: [
                reportName: 'Backend Snyk Report',
                reportDir: "${REPORT_DIR}",
                reportFiles: 'backend-snyk.html',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: true
            ])

            publishHTML(target: [
                reportName: 'Frontend Snyk Report',
                reportDir: "${REPORT_DIR}",
                reportFiles: 'frontend-snyk.html',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: true
            ])
        }
        failure {
            echo '❌ Pipeline failed due to high severity vulnerabilities. Check HTML reports.'
        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
    }
}
