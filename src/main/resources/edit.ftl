<script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>
<div id="Galeria_${instanceId}" class="super-widget wcm-widget-class fluig-style-guide" data-params="Galeria.instance()">
    <h1>${i18n.getTranslation('application.title')}</h1>
    <form role="form" id="editForm_${instanceId}" name="editForm_${instanceId}">
        <div class="form-group">
            <label for="fluigDirectoryIDEdit_${instanceId}">${i18n.getTranslation('galeria.defaultfolder')}</label>
            <input type="text" id="fluigDirectoryIDEdit_${instanceId}" name="fluigDirectoryIDEdit_${instanceId}" value="${fluigDirectoryID!}" class="form-control" /> 
        </div>
        <button type="button" class="btn btn-default" data-save-preferences>${i18n.getTranslation('galeria.save')}</button>
    </form>
</div>

