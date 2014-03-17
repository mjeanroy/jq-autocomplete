jq-autocomplete
=================================

Very simple autocomplete for text input field.

Getting started
---------------

### How?

HTML:

```
<script type="text/javascript" src="jq-autocomplete.js"></script>
<link rel="stylesheet" href="jq-autocomplete.css"/>

<input type="text" id="my-autocomplete" />
```

JS:

```
$('#my-autocomplete').jqAutoComplete();
```

Results:

Suggestions are automatically added below the input field:

![Auto Complete](docs/001.png)

Select active result using up / down key or click with your mouse:

![Auto Complete](docs/002.png)

### Advanced

#### HTML initialization
Plugin can be initialized using html5 data attribute.

Every option can be inlined such as:

```
<input type="text"
       data-url="/query"
       data-method="get"
/>
```

#### Cache
A cache is automatically managed by autocomplete (but it can be disabled). It means that the first time a query is sent, results are automatically saved. Next time, results will be retrieved from cache and the HTTP request will not be executed again.

#### Creation
Autocomplete can display a creation form if user want to be able to create new suggestion.
At creation, the autocomplete will have to know the form to used. The form will be cloned and a link to display the form will be automatically visible to create new suggestions (see samples).

A link is automatically added to display a form that will create new entry:

![Links used to create new entry](docs/003.png)

Form is cloned and automatically added:

![Create new entry](docs/004.png)

#### Destroy
Don't worry about memory management, plugin will be automatically destroyed when related input is removed from DOM.

### Options

- `url`: URL used to fetch results.

- `method`: HTTP method used to fetch results. Default is *GET*.

- `minSize`: : Minimum number of characters required to trigger autocomplete. Default is *3*.

- `limit`: Maximum number of results to retrieve (will be sent over http). Default is *10*.

- `filterName`: Name of parameter containing filter value. Default is *filter*.

- `limitName`: Name of parameter containing limit value. Default is *limit*.

- `datas`: Custom parameter that will added to the fetch query. Default is *null* (it means that no additional parameter is sent).

- `cache`: Boolean value indicating whether to cache autocomplete results. Default is *true*.

- `label`: Field to show in suggestions list. Can be a string (field that will be display) or a function (must return the formatted field to display). Default is *label*.

- `relativeTo`: Suggestion list will be in absolute position. Relative position will be appended to input parent by default, unless an other selector is set using this option. Default is *null*. 

- `$createForm`: Form that will be display to create new result.

- `saveUrl`: URL that will be used to save current result. Default is the GET url.

- `saveMethod`: HTTP method that will be used to save new result. Default is *POST*.

- `saveDataType`: Content-Type returned by creation request. Default is *json*".

- `saveContentType`: Content-Type added to creation request. Default is *application/x-www-form-urlencoded; charset=UTF-8*.

- `createLabel`: Link displayed to show creation form. Default is *Not here? Create it!*.

- `cancel`: Label displayed in cancel 'button' (in creation form). Default is *Cancel*.

- `submit`: Label displayed in submit 'button' (in creation form). Default is *Save*.

- `isValid`: Callback function used to check validity of creation form and called before creation request. If function return a falsy value, creation request will not be triggered.

- `onSaved`: Callback function called before creation request. Returned object will be used as parameter during creation request (useful to override some parameter).

- `onSavedSuccess`: Callback function called after creation request succeed.

- `onSavedFailed`: Callback function called after creation request failed.

- `onShown`: Callback function called when suggestion list is displayed.

- `onHidden`: Callback function called when suggestion list is hidden.

- `onDestroyed`: Callback function called when autocomplete plugin is destroyed.

- `select`: Callback function called when a suggestion result is selected.

- `unSelect`: Callback function called when selected result is "un-selected".

- `focusout`: Callback function called when focus out event is triggered.

### Licence

### Credits
