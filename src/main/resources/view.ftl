<#assign parameters="{instanceId: '${instanceId!}', fluigDirectoryID: '${fluigDirectoryID!}'}" ?html>
	<div id="Galeria_${instanceId}" class="super-widget wcm-widget-class fluig-style-guide" data-params="Galeria.instance(${parameters})">
		<script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>
		<script src="/portal/resources/js/mustache/mustache-min.js"></script>
		<div class="">
			<div data-galeria></div>
		</div>
	</div>
	<script type="text/template" class="tpl-continuous-scroll">
		{{#error}}
			<div class="alert alert-info" role="alert"><h3 class="fs-no-margin-top"><strong>{{error}}</strong></h3></div>
		{{/error}}

		<div class="row" style="padding: 20px 0px;">
			<div class="col-lg-4 col-md-4 col-sm-6">
				{{#parentDocumentId}}
					<button class="btn btn-default" id="{{parentDocumentId}}" data-open-folder>
						Voltar
					</button>
				{{/parentDocumentId}}
			</div>
		</div>

		<div class="row">
			{{#items}}
				<div class="col-lg-4 col-md-4 col-sm-6">
					<div class="card">
						{{#isFolder}}
						<div class="card-thumb card-thumb-img">
							<div class="card-thumb-actions">
								{{#linkhref}}
									<button class="btn btn-default" id="{{documentId}}" data-open-folder>
										Abrir pasta
									</button>
								{{/linkhref}}
							</div>
							<img src="{{src}}" alt="{{alt}}">
						</div>
						{{/isFolder}}
						{{^isFolder}}
						<div class="card-thumb card-thumb-img">
							<div class="card-thumb-actions">
								{{#ecmLink}}
									<a href="{{ecmLink}}" target="_blank" type="button" class="btn btn-primary">
										Visualizar
									</a>
								{{/ecmLink}}
								{{#linkhref}}
									<a href="{{linkhref}}" target="_blank" type="button" class="btn btn-default" download>
										Baixar
									</a>
								{{/linkhref}}
							</div>
							<img src="{{src}}" alt="{{alt}}">
						</div>
						{{/isFolder}}
						<div class="card-body">
							<div class="card-title-with-actions">
								<h1 class="card-normal-title">
									{{alt}}
								</h1>
							</div>
							{{#mimetype}}
								<p class="card-small-text"><b>Tipo:</b> {{mimetype}}</p>
							{{/mimetype}}
						</div>
					</div>
				</div>
			{{/items}}
		</div>
	
	</script>