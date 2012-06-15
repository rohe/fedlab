# OpenID Connect Provider Metadata


Basic example:

	{
		"versions": {
			"oauth": "2.0",
			"openid": "3.0"
		},
		"provider": {
			"supported_response_types": ["code", "code id_token"],
			"supported_scopes": ["openid"],
			"algoritms": ["HS256"],
			"issuer": "http://kodtest.se:8080",
			"dynamic": "http://kodtest.se:8080"
		},
		"features": {
			"discovery": true,
			"registration": true,
			"sessionmanagement": true,
			"key_export": true,
			"use_nonce": true
		},
		"client": {
			"auth_type": "client_secret_basic",
			"client_type": "confidential",
			"client_id": "bc49e332-4061-4576-a8ab-bf317116c1b4",
			"redirect_uris": ["https://%s/authz_cb"],
			"client_secret": "",
			"key_export_url": "http://%s:8090/export"
		}
	}