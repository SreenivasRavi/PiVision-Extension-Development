import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLibrary, SymbolType, SymbolInputType, ConfigPropType } from './framework';
import { LibModuleNgFactory } from './module.ngfactory';
import { SunburstTreeviewComponent } from './Sunburst-Treeview/Sunburst-Treeview.component';

import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [ SunburstTreeviewComponent ],
  imports: [ CommonModule, HttpClientModule] ,
  exports: [ SunburstTreeviewComponent],
  entryComponents: [ SunburstTreeviewComponent],
  bootstrap:    [ SunburstTreeviewComponent ]
})
export class LibModule { }

export class ExtensionLibrary extends NgLibrary {
  module = LibModule;
  moduleFactory = LibModuleNgFactory;
  symbols: SymbolType[] = [
    {
      name: 'Sunburst-Treeview-symbol',
      displayName: 'Sunburst Treeview',
      dataParams: { shape: 'single' },
      thumbnail: '^/assets/images/sunburst.png',
      generalConfig: [
        {
          name: 'Options',
          isExpanded: true,
          configProps: [
            {propName:'TreePath',displayName:'Treeview Element Path(AFServer\\DB\\Src Element..)',configType:ConfigPropType.Text},
            { propName: 'attributes',displayName:'Attribute to Display',configType:ConfigPropType.Text},
            { propName: 'chartWidth',displayName:'Chart Width(in px)',configType:ConfigPropType.Text,defaultVal:'700'},
            { propName: 'chartHeight',displayName:'Chart Height(in px)',configType:ConfigPropType.Text,defaultVal:'700'},
            { propName: 'refreshRate',displayName:'Refresh Rate(in seconds)',configType:ConfigPropType.Text,defaultVal:'60'},
            { propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white'}
          ]
        }
      ],
      compCtor: SunburstTreeviewComponent,
      inputs: [
        SymbolInputType.Data,
        SymbolInputType.PathPrefix
      ],
     
      layoutWidth: 200,
      layoutHeight: 100
    }
  ];
}
