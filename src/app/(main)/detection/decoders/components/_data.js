export const mockServices = [
    {
        id: 'svc_apache',
        name: 'Apache',
        prefilter: 'HTTP',
        isActive: true,
        decoders: [
            { id: 'dec_1', name: 'apache_access_log', regex: '^(?<client_ip>\\d{1,3}\\..+)', log_example: '172.16.0.5 - - [18/Aug/2025:13:30:01 +0530] "POST /api/login HTTP/1.1" 200 150', isActive: true },
            { id: 'dec_2', name: 'apache_error_log', regex: '^\\[.+\\]\\s\\[(?<log_level>\\w+)\\].+', log_example: '[Mon Aug 18 14:01:00 2025] [error] [client 192.168.1.1] File does not exist: /var/www/html/favicon.ico', isActive: true },
            { id: 'dec_3', name: 'mod_security_audit', regex: '.*ModSecurity:.*id\\s"(?<modsec_id>\\d+)"', log_example: 'ModSecurity: Access denied with code 403 (phase 2). Matched phrase "bin/sh" at ARGS:cmd. [id "950103"]', isActive: false },
        ],
    },
    {
        id: 'svc_ssh',
        name: 'SSH',
        prefilter: 'sshd',
        isActive: true,
        decoders: [
            { id: 'dec_4', name: 'ssh_failed_auth', regex: '^.+Failed password for.*from (?<src_ip>.+)', log_example: 'Aug 18 13:31:15 server sshd[12345]: Failed password for invalid user admin from 203.0.113.5 port 22 ssh2', isActive: true },
            { id: 'dec_5', name: 'ssh_successful_login', regex: '^.+Accepted password for.*from (?<src_ip>.+)', log_example: 'Aug 18 13:32:00 server sshd[12346]: Accepted password for user root from 198.51.100.2 port 5678 ssh2', isActive: true },
        ],
    },
];