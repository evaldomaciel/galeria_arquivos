var Galeria = SuperWidget.extend({
    instanceId: this.instanceId,
    widgetVersion: null,
    sourceType: null,
    applicationSourceClientID: null,
    fluigDirectoryName: null,
    fluigDirectoryID: 309,
    fluigDirectoryNav: 0,
    showImageTitle: null,
    autoSize: false,
    resize: false,
    mapAttrs: {
        TYPE_FLUIGDIR: 'FluigDir',
        ERROR_TYPE_API_NOT_ALLOWED: 'APINotAllowedError',
        ERROR_TYPE_API_INVALID_CLIENT: 'OAuthParameterException',
        LIMIT_CHAR_MESSAGE: 119
    },

    bindings: {
        local: {
            'option-fluigdir': ['click_fluigDirChosen'],
            'usedefault-clientid': ['click_useDefaultClientID'],
            'save-preferences': ['click_savePreferences'],
            'open-folder': ['click_openFolder'],
            'find-fluigdir': ['click_chooseDirectory']
        },
        global: {}
    },

    init: function () {
        let that = this;
        if (that.isEditMode) {
            that.editMode();
        } else {
            that.viewMode();
        }
    },

    openFolder: function (htmlElement, event) {
        console.log(htmlElement);
        console.log(event);
        console.log(event.currentTarget.id);
        this.getFluigImageReader(event.currentTarget.id);
    },

    getParent: function (documentId) {
        let datasetDocument = DatasetFactory.getDataset('document', ['parentDocumentId'], [
            DatasetFactory.createConstraint('documentPK.documentId', documentId, documentId, ConstraintType.MUST)
        ], null);
        if (datasetDocument.values) return datasetDocument.values[0].parentDocumentId;
        return this.fluigDirectoryID;
    },

    definePreferences: function () {
        let mode = this.getMode();
        this.sourceType = $('#sourceType' + mode).val();
        this.applicationSourceClientID = $('#applicationSourceClientID' + mode).val();
        this.fluigDirectoryID = $('#fluigDirectoryID' + mode).val();
        this.fluigDirectoryName = $('#fluigDirectoryName' + mode).val();
        this.showImageTitle = $('#showImageTitle' + mode).prop('checked');
        this.autoSize = $("#autoSize" + mode).prop('checked');
        this.resize = $("#resize" + mode).prop('checked');
    },

    getMode: function () {
        return ((this.isEditMode) ? 'Edit' : 'View') + '_' + this.instanceId;
    },

    setDirectory: function (doc) {
        let mode = this.getMode();

        this.fluigDirectoryID = doc.documentId;
        $('#fluigDirectoryID' + mode).val(this.fluigDirectoryID);

        this.fluigDirectoryName = doc.documentDescription;
        $('#fluigDirectoryName' + mode).val(this.fluigDirectoryName);
    },

    viewMode: function () {
        if (this.fluigDirectoryNav == 0) { this.getFluigImageReader(this.fluigDirectoryID) }
        else { this.getFluigImageReader(this.fluigDirectoryNav) }
    },

    loadFluigImages: function (data) {
        let that = this, images = [], len = data.length, item, image;
        let parentDocumentId = 0;
        let parentDocumentIdItem = 0;
        for (let i = 0; i < len; i++) {
            item = data[i];
            //if (item.mimetype && that.validateMimeType(item)) {}
            image = {
                src: that.getFluigFileUrl(item),
                ecmLink: that.getFluigFileECM(item),
                linkhref: that.getFluigFileECMDownload(item),
                author: item.colleagueId,
                title: (/^true$/i.test(that.showImageTitle)) ? that.cropMessage(that.getFluigFileDescription(item))
                    : '',
                alt: that.getFluigFileDescription(item),
                documentId: item['documentPK.documentId'],
                mimetype: item.mimetype,
                isFolder: item.documentType == 4 || item.documentType == 1 ? true : false,
            };
            images.push(image);
            parentDocumentIdItem = item.parentDocumentId;
        }
        if (images.length > 0) {
            parentDocumentId = this.getParent(parentDocumentIdItem);
            that.buildGaleria(images, parentDocumentId);
        } else {
            this.displayNoDataFoundMessage();
        }
    },

    validateMimeType: function (item) {
        let mimeTypes = ['image/jpeg', 'image/bmp', 'image/x-windows-bmp', 'image/pjpeg', 'image/png', 'image/gif'];
        for (let index in mimeTypes) {
            let mime = mimeTypes[index];
            if (item.mimetype === mime) {
                return true;
            }
        }
        return false;
    },

    buildGaleria: function (images, parentDocumentId) {
        if (images && images.length) {
            let tpl = $('.tpl-continuous-scroll').html(),
                html,
                items = { items: images, parentDocumentId: parentDocumentId };
            html = Mustache.render(tpl, items);
            $('[data-galeria]').html(html);

        } else {
            this.showMessage('', 'warning', '${i18n.getTranslation("kit_Galeria.error.nodatatodisplay")}');
        }
    },

    getFluigFileECM: function (item) {
        return WCMAPI.tenantURL + '/ecmnavigation?app_ecm_navigation_doc=' + item['documentPK.documentId'];
    },

    getFluigFileECMDownload: function (item) {
        let nrDocto = item['documentPK.documentId'];
        let nrVersao = item['documentPK.version'];
        let companyId = item['documentPK.companyId'];
        return WCMAPI.getServerURL() + '/webdesk/streamcontrol/' + item.phisicalFile + '?WDNrDocto=' + nrDocto
            + '&WDNrVersao=' + nrVersao + '&WDCompanyId=' + companyId
    },

    getFluigFileUrl: function (item) {
        let that = this;
        let nrDocto = item['documentPK.documentId'];
        let nrVersao = item['documentPK.version'];
        let companyId = item['documentPK.companyId'];

        let fluigFileUrl = (item.iconId === 0 && !item.mimetype) ? "/webdesk/icone/23.png" : "/webdesk/icone/10.png";
        if (item.mimetype && that.validateMimeType(item)) {
            fluigFileUrl = WCMAPI.getServerURL() + '/webdesk/streamcontrol/' + item.phisicalFile + '?WDNrDocto=' + nrDocto
                + '&WDNrVersao=' + nrVersao + '&WDCompanyId=' + companyId
        }
        return fluigFileUrl
    },

    getFluigFileDescription: function (item) {
        if (item.additionalComments) {
            return item.additionalComments;
        }
        return item.documentDescription;
    },

    editMode: function () {
        if (this.sourceType === this.mapAttrs.TYPE_FLUIGDIR) {
            this.fluigDirChosen();
        }
    },

    savePreferences: function () {
        let that = this;
        that.definePreferences();
        that.save(that.getPreferences());
    },

    parseError: function (response) {
        let that = this;
        switch (response.meta.error_type) {
            case that.mapAttrs.ERROR_TYPE_API_NOT_ALLOWED:
                return '${i18n.getTranslation("kit_Galeria.error.apinotallowed")}';
            case that.mapAttrs.ERROR_TYPE_API_INVALID_CLIENT:
                return '${i18n.getTranslation("kit_Galeria.error.invalidclientid")}';
            default:
                return response.meta.error_message;
        }
    },

    getFluigImageReader: function (fluigDirectoryID) {
        let dataset = DatasetFactory.getDataset('document', null, [
            DatasetFactory.createConstraint('parentDocumentId', fluigDirectoryID, fluigDirectoryID, ConstraintType.MUST),
            DatasetFactory.createConstraint('activeVersion', true, true, ConstraintType.MUST),
            DatasetFactory.createConstraint('documentPK.companyId', WCMAPI.getTenantId(), WCMAPI.getTenantId(), ConstraintType.MUST)
        ], null);

        if (dataset && dataset.values.length > 0) {
            let docId = dataset.values[0].uUID;
            if (docId || docId.length) {
                this.loadFluigImages(dataset.values);
            } else {
                this.displayNoDataFoundMessage();
            }
        } else {
            this.displayNoDataFoundMessage();
        }
    },

    displayNoDataFoundMessage: function () {
        let that = this;
        that.error = '${i18n.getTranslation("kit_Galeria.error.nodatatodisplay")}'
        let tpl = $('.tpl-continuous-scroll').html(),
            html,
            items = { error: that.error };
        html = Mustache.render(tpl, items);
        $('[data-galeria]').html(html);
    },

    save: function (preferences) {
        let that = this;
        if (that.sourceType === that.mapAttrs.TYPE_FLUIGDIR && preferences.fluigDirectoryName === ''
            && preferences.fluigDirectoryID === '') {
            that.showMessageError('', '${i18n.getTranslation("kit_Galeria.edit.error.atleastone")}');
        } else {
            WCMSpaceAPI.PageService.UPDATEPREFERENCES({
                async: true,
                success: function (data) {
                    FLUIGC.toast({
                        title: data.message,
                        message: '',
                        type: 'success'
                    });
                },
                fail: function (xhr, message, errorData) {
                    that.showMessageError('', errorData.message);
                }
            }, that.instanceId, preferences);
        }
    },

    showMessageError: function (title, error) {
        this.showMessage(title, 'danger', error);
    },

    showMessage: function (title, type, message) {
        FLUIGC.toast({
            title: title,
            type: type,
            message: message
        });
    },

    getPreferences: function () {
        return {
            sourceType: this.sourceType,
            applicationSourceClientID: this.applicationSourceClientID,
            fluigDirectoryID: this.fluigDirectoryID,
            fluigDirectoryName: this.fluigDirectoryName,
            showImageTitle: this.showImageTitle,
            autoSize: this.autoSize,
            resize: this.resize
        };
    },

    fluigDirChosen: function () {
        this.chooseSourceType(this.mapAttrs.TYPE_FLUIGDIR);
    },

    chooseSourceType: function (type) {
        let $optionButton = $('#sourceTypeButton_' + this.instanceId);
        let displayFluigDirData = null;
        $('#sourceType' + this.getMode()).val(type);
        this.sourceType = type;
        if (type === this.mapAttrs.TYPE_FLUIGDIR) {
            $optionButton.text('${i18n.getTranslation("kit_Galeria.source.fluigdir")}' + ' ');
            displayFluigDirData = '';
            $("#showImageTitleEdit_" + this.instanceId).removeClass('fs-display-none');
        }
        $("#formFluigDir_" + this.instanceId).attr('style', 'display: ' + displayFluigDirData + ';');
        $('<span>').addClass('caret').appendTo($optionButton);
    },

    chooseDirectory: function () {
        let that = this;

        ECMBC.searchDocument({
            showPrivate: false,
            showCheckOutDocs: false,
            selectableDocTypeId: '1',
            title: '${i18n.getTranslation("kit_Galeria.edit.copyPhisicalFile.title")}',
            height: "calc(100vh - 138px)" // 138px é a soma da altura do header/footer/margens da modal
        }, function (err, document) {
            if (err) {
                FLUIGC.message.alert({
                    message: '${i18n.getTranslation("kit_Galeria.error.loaddirectories")}',
                    title: '${i18n.getTranslation("kit_Galeria.source.ecmdir")}',
                    label: '${i18n.getTranslation("kit_Galeria.label.close")}'
                });
                return false;
            }

            that.setDirectory(document);
        });
    },

    cropMessage: function (message) {
        let croppedMessage = '';
        if (message.length > this.mapAttrs.LIMIT_CHAR_MESSAGE) {
            croppedMessage = message.substring(0, this.mapAttrs.LIMIT_CHAR_MESSAGE);
            croppedMessage = croppedMessage.concat("...");
        } else {
            croppedMessage = message;
        }

        return croppedMessage;
    }
});