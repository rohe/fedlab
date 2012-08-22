<?php

/**
 * Class representing a SAML 2 assertion.
 *
 * @package simpleSAMLphp
 * @version $Id$
 */
class sspmod_fedlab_xml_AssertionMultipleAttrStatements extends sspmod_fedlab_xml_Assertion implements SAML2_SignedElement {




	/**
	 * Convert this assertion to an XML element.
	 *
	 * @param DOMNode|NULL $parentElement  The DOM node the assertion should be created in.
	 * @return DOMElement  This assertion.
	 */
	public function toXML(DOMNode $parentElement = NULL) {

		if ($parentElement === NULL) {
			$document = new DOMDocument();
			$parentElement = $document;
		} else {
			$document = $parentElement->ownerDocument;
		}

		$root = $document->createElementNS(SAML2_Const::NS_SAML, 'saml:' . 'Assertion');
		$parentElement->appendChild($root);

		/* Ugly hack to add another namespace declaration to the root element. */
		$root->setAttributeNS(SAML2_Const::NS_SAMLP, 'samlp:tmp', 'tmp');
		$root->removeAttributeNS(SAML2_Const::NS_SAMLP, 'tmp');
		$root->setAttributeNS(SAML2_Const::NS_XSI, 'xsi:tmp', 'tmp');
		$root->removeAttributeNS(SAML2_Const::NS_XSI, 'tmp');
		$root->setAttributeNS(SAML2_Const::NS_XS, 'xs:tmp', 'tmp');
		$root->removeAttributeNS(SAML2_Const::NS_XS, 'tmp');

		$root->setAttribute('ID', $this->id);
		$root->setAttribute('Version', '2.0');
		$root->setAttribute('IssueInstant', gmdate($this->dateformat, $this->issueInstant));

		$issuer = SAML2_Utils::addString($root, SAML2_Const::NS_SAML, 'saml:Issuer', $this->issuer);

		$this->addSubject($root);
		$this->addConditions($root);
		$this->addAuthnStatement($root);


		// Add two sets of attributestatements
		$tmpattr = $this->attributes;
		$this->attributes = array('urn:foo' => array('bar'));
		$this->addAttributeStatement($root);
		$this->attributes = $tmpattr;
		$this->addAttributeStatement($root);
		
			

		if ($this->signatureKey !== NULL) {
			SAML2_Utils::insertSignature($this->signatureKey, $this->certificates, $root, $issuer->nextSibling);
		}

		return $root;
	}


	/**
	 * Add a Subject-node to the assertion.
	 *
	 * @param DOMElement $root  The assertion element we should add the subject to.
	 */
	protected function addSubject(DOMElement $root) {

		if ($this->nameId === NULL) {
			/* We don't have anything to create a Subject node for. */
			return;
		}

		$subject = $root->ownerDocument->createElementNS(SAML2_Const::NS_SAML, 'saml:Subject');
		$root->appendChild($subject);

		SAML2_Utils::addNameId($subject, $this->nameId);



		if ($this->iterateSubjectConfirmationData) {

			$sc = $root->ownerDocument->createElementNS(SAML2_Const::NS_SAML, 'saml:SubjectConfirmation');
			$subject->appendChild($sc);

			$sc->setAttribute('Method', SAML2_Const::CM_BEARER);

			
			if ($this->addSubjectConfirmationData) {
				
				foreach($this->destination AS $dest) {

					foreach($this->subjectAddresses AS $adr) {

						$scd = $root->ownerDocument->createElementNS(SAML2_Const::NS_SAML, 'saml:SubjectConfirmationData');
						$sc->appendChild($scd);
				
						if ($this->notOnOrAfterSubjectConfirmationData !== NULL) {
							$scd->setAttribute('NotOnOrAfter', gmdate($this->dateformat, $this->notOnOrAfterSubjectConfirmationData));
						}
						if ($dest !== NULL) {
							$scd->setAttribute('Recipient', $dest);
						}
						if ($this->inResponseTo !== NULL) {
							$scd->setAttribute('InResponseTo', $this->inResponseTo);
						}						
						if (!empty($adr)) {
							$scd->setAttribute('Address', $adr);
						}
					
					}

				}		
				
			} 
			
		} else {
			
			
			if ($this->addSubjectConfirmationData) {
			
				foreach($this->destination AS $dest) {

					foreach($this->subjectAddresses AS $adr) {


						$sc = $root->ownerDocument->createElementNS(SAML2_Const::NS_SAML, 'saml:SubjectConfirmation');
						$subject->appendChild($sc);

						$sc->setAttribute('Method', SAML2_Const::CM_BEARER);
					
						$scd = $root->ownerDocument->createElementNS(SAML2_Const::NS_SAML, 'saml:SubjectConfirmationData');
						$sc->appendChild($scd);
			
						if ($this->notOnOrAfterSubjectConfirmationData !== NULL) {
							$scd->setAttribute('NotOnOrAfter', gmdate($this->dateformat, $this->notOnOrAfterSubjectConfirmationData));
						}
						if ($dest !== NULL) {
							$scd->setAttribute('Recipient', $dest);
						}
						if ($this->inResponseTo !== NULL) {
							$scd->setAttribute('InResponseTo', $this->inResponseTo);
						}
						
						if (!empty($adr)) {
							$scd->setAttribute('Address', $adr);
						}
					}
				}



			} else {
				
				$sc = $root->ownerDocument->createElementNS(SAML2_Const::NS_SAML, 'saml:SubjectConfirmation');
				$subject->appendChild($sc);

				$sc->setAttribute('Method', SAML2_Const::CM_BEARER);
				
			}
			
			
			
			
		}
	}


	/**
	 * Add a Conditions-node to the assertion.
	 *
	 * @param DOMElement $root  The assertion element we should add the conditions to.
	 */
	protected function addConditions(DOMElement $root) {

		$document = $root->ownerDocument;

		$conditions = $document->createElementNS(SAML2_Const::NS_SAML, 'saml:Conditions');
		$root->appendChild($conditions);

		if ($this->notBefore !== NULL) {
			$conditions->setAttribute('NotBefore', gmdate($this->dateformat, $this->notBefore));
		}
		if ($this->notOnOrAfter !== NULL) {
			$conditions->setAttribute('NotOnOrAfter', gmdate($this->dateformat, $this->notOnOrAfter));
		}

		if ($this->validAudiences !== NULL) {
			
			foreach($this->validAudiences AS $va) {
				$ar = $document->createElementNS(SAML2_Const::NS_SAML, 'saml:AudienceRestriction');
				$conditions->appendChild($ar);

				SAML2_Utils::addStrings($ar, SAML2_Const::NS_SAML, 'saml:Audience', FALSE, $va);
				
			}
			
		}
		
		if ($this->extracondition !== NULL) {
			$ar = $document->createElementNS(SAML2_Const::NS_SAML, 'saml:Condition');
			
			$conditions->appendChild($ar);
			
#			$ar->setAttribute('xsi:type', 'fedlab:UnknownType');
			$ar->setAttributeNS(SAML2_Const::NS_XSI, 'xsi:type', 'fedlab:UnknownType');
			
            $ar->setAttributeNS('https://rnd.feide.no/fedlab-ns', 'fedlab:tmp', 'tmp');
            $ar->removeAttributeNS('https://rnd.feide.no/fedlab-ns', 'tmp');

			
			
			SAML2_Utils::addStrings($ar, 'https://rnd.feide.no/fedlab-ns', 'fedlab:Unknown', FALSE, 
				array('SP should not be able to determine the validity of this assertion, becasue this Condition is unknown'));
				
			
		}
	}


	/**
	 * Add a AuthnStatement-node to the assertion.
	 *
	 * @param DOMElement $root  The assertion element we should add the authentication statement to.
	 */
	protected function addAuthnStatement(DOMElement $root) {

		if ($this->authnContext === NULL) {
			/* No authentication context => no authentication statement. */
			return;
		}

		$document = $root->ownerDocument;

		$as = $document->createElementNS(SAML2_Const::NS_SAML, 'saml:AuthnStatement');
		$root->appendChild($as);

		$as->setAttribute('AuthnInstant', gmdate($this->dateformat, $this->authnInstant));

		if ($this->sessionNotOnOrAfter !== NULL) {
			$as->setAttribute('SessionNotOnOrAfter', gmdate($this->dateformat, $this->sessionNotOnOrAfter));
		}
		if ($this->sessionIndex !== NULL) {
			$as->setAttribute('SessionIndex', $this->sessionIndex);
		}

		$ac = $document->createElementNS(SAML2_Const::NS_SAML, 'saml:AuthnContext');
		$as->appendChild($ac);

		SAML2_Utils::addString($ac, SAML2_Const::NS_SAML, 'saml:AuthnContextClassRef', $this->authnContext);
		SAML2_Utils::addStrings($ac, SAML2_Const::NS_SAML, 'saml:AuthenticatingAuthority', false, $this->AuthenticatingAuthority);
	}


	/**
	 * Add an AttributeStatement-node to the assertion.
	 *
	 * @param DOMElement $root  The assertion element we should add the subject to.
	 */
	protected function addAttributeStatement(DOMElement $root) {

		if (empty($this->attributes)) {
			return;
		}

		$document = $root->ownerDocument;

		$attributeStatement = $document->createElementNS(SAML2_Const::NS_SAML, 'saml:AttributeStatement');
		$root->appendChild($attributeStatement);

		foreach ($this->attributes as $name => $values) {
			$attribute = $document->createElementNS(SAML2_Const::NS_SAML, 'saml:Attribute');
			$attributeStatement->appendChild($attribute);
			$attribute->setAttribute('Name', $name);

			if ($this->nameFormat !== SAML2_Const::NAMEFORMAT_UNSPECIFIED) {
				$attribute->setAttribute('NameFormat', $this->nameFormat);
			}

			foreach ($values as $value) {
				if (is_string($value)) {
					$type = 'xs:string';
				} elseif (is_int($value)) {
					$type = 'xs:integer';
				} else {
					$type = NULL;
				}

				$attributeValue = $document->createElementNS(SAML2_Const::NS_SAML, 'saml:AttributeValue');
				$attribute->appendChild($attributeValue);
				if ($type !== NULL) {
					$attributeValue->setAttributeNS(SAML2_Const::NS_XSI, 'xsi:type', $type);
				}

				if ($value instanceof DOMNodeList) {
					for ($i = 0; $i < $value->length; $i++) {
						$node = $document->importNode($value->item($i), TRUE);
						$attributeValue->appendChild($node);
					}
				} else {
					$attributeValue->appendChild($document->createTextNode($value));
				}
			}
		}
	}


	/**
	 * Add an EncryptedAttribute Statement-node to the assertion.
	 *
	 * @param DOMElement $root  The assertion element we should add the Encrypted Attribute Statement to.
	 */
	protected function addEncryptedAttributeStatement(DOMElement $root) {

		if ($this->requiredEncAttributes == FALSE)
			return;

		$document = $root->ownerDocument;

		$attributeStatement = $document->createElementNS(SAML2_Const::NS_SAML, 'saml:AttributeStatement');
		$root->appendChild($attributeStatement);

		foreach ($this->attributes as $name => $values) {
			$document2 = new DOMDocument();
			$attribute = $document2->createElementNS(SAML2_Const::NS_SAML, 'saml:Attribute');
			$attribute->setAttribute('Name', $name);
			$document2->appendChild($attribute);

			if ($this->nameFormat !== SAML2_Const::NAMEFORMAT_UNSPECIFIED) {
				$attribute->setAttribute('NameFormat', $this->nameFormat);
			}

			foreach ($values as $value) {
				if (is_string($value)) {
					$type = 'xs:string';
				} elseif (is_int($value)) {
					$type = 'xs:integer';
				} else {
					$type = NULL;
				}

				$attributeValue = $document2->createElementNS(SAML2_Const::NS_SAML, 'saml:AttributeValue');
				$attribute->appendChild($attributeValue);
				if ($type !== NULL) {
					$attributeValue->setAttributeNS(SAML2_Const::NS_XSI, 'xsi:type', $type);
				}

				if ($value instanceof DOMNodeList) {
					for ($i = 0; $i < $value->length; $i++) {
						$node = $document2->importNode($value->item($i), TRUE);
						$attributeValue->appendChild($node);
					}
				} else {
					$attributeValue->appendChild($document2->createTextNode($value));
				}
			}
			/*Once the attribute nodes are built, the are encrypted*/
			$EncAssert = new XMLSecEnc();
			$EncAssert->setNode($document2->documentElement);
			$EncAssert->type = 'http://www.w3.org/2001/04/xmlenc#Element';
			/*
			 * Attributes are encrypted with a session key and this one with
			 * $EncryptionKey
			 */
			$symmetricKey = new XMLSecurityKey(XMLSecurityKey::AES256_CBC);
			$symmetricKey->generateSessionKey();
			$EncAssert->encryptKey($this->encryptionKey, $symmetricKey);
			$EncrNode = $EncAssert->encryptNode($symmetricKey);

			$EncAttribute = $document->createElementNS(SAML2_Const::NS_SAML, 'saml:EncryptedAttribute');
			$attributeStatement->appendChild($EncAttribute);
			$n = $document->importNode($EncrNode,true);
			$EncAttribute->appendChild($n);
		}
	}

}
